"""
Tremor kinematic analysis module.
Adapts displacement calculation and FFT spectral estimation concepts from parkscreen,
enhanced with timestamp interpolation and medical limitations checks.
"""
import numpy as np
from app.schemas.telemetry import TremorAnalysisRequest, TremorAnalysisResponse, FrequencySpectrumPoint
from app.modules.signal_processing.filters import (
    resample_to_uniform_grid,
    butter_bandpass_filter,
    compute_fft_spectrum,
    extract_dominant_frequency,
    calculate_band_power_ratio,
    compute_amplitude_envelope,
    compute_linear_slope
)

def analyze_tremor_stream(request: TremorAnalysisRequest) -> TremorAnalysisResponse:
    if len(request.samples) < 15:
        return TremorAnalysisResponse(
            status="insufficient_data",
            effective_fps=0.0,
            duration_seconds=0.0,
            dominant_frequency_hz=0.0,
            power_ratio_4_6hz=0.0,
            mean_amplitude=0.0,
            amplitude_slope=0.0,
            frequency_spectrum=[],
            filtered_waveform=[],
            quality_warning="At least 15 video frames are required for analysis"
        )
    
    timestamps = np.array([s.timestamp_ms for s in request.samples], dtype=float)
    idx = request.tracking_landmark_idx
    
    # Extract coordinates of target landmark (default landmark 8 - Index fingertip)
    raw_coords = []
    for s in request.samples:
        if len(s.landmarks) > idx:
            raw_coords.append([s.landmarks[idx].x, s.landmarks[idx].y])
        else:
            raw_coords.append([0.0, 0.0])
    raw_coords = np.array(raw_coords)
    
    duration_sec = (timestamps[-1] - timestamps[0]) / 1000.0
    effective_fps = len(timestamps) / max(0.1, duration_sec)
    
    # Calculate 1D or 2D projected displacement along principal axis of motion
    # Using signed deviation along the dominant movement axis preserves fundamental frequency f0
    center = raw_coords.mean(axis=0)
    centered_coords = raw_coords - center
    
    # Principal component direction
    if len(centered_coords) >= 2:
        cov = np.cov(centered_coords.T)
        evals, evecs = np.linalg.eigh(cov)
        principal_vector = evecs[:, -1] # Direction of largest variance
        displacement = np.dot(centered_coords, principal_vector)
    else:
        displacement = centered_coords[:, 0]
    
    # Resample to uniform sampling grid to eliminate webcam timestamp jitter
    target_fs = max(20.0, min(60.0, request.target_fs))
    t_uniform, disp_uniform = resample_to_uniform_grid(timestamps, displacement, target_fs=target_fs)
    
    if len(disp_uniform) < 15:
        return TremorAnalysisResponse(
            status="low_duration",
            effective_fps=effective_fps,
            duration_seconds=duration_sec,
            dominant_frequency_hz=0.0,
            power_ratio_4_6hz=0.0,
            mean_amplitude=0.0,
            amplitude_slope=0.0,
            frequency_spectrum=[],
            filtered_waveform=[],
            quality_warning="Recording duration too brief for reliable spectral analysis."
        )
        
    # Bandpass filter (0.5 to 12.0 Hz)
    filtered = butter_bandpass_filter(disp_uniform, lowcut=0.5, highcut=12.0, fs=target_fs)
    
    # FFT and Spectral Metrics
    freqs, amps = compute_fft_spectrum(filtered, fs=target_fs)
    dom_freq, peak_amp = extract_dominant_frequency(freqs, amps, f_min=0.5, f_max=12.0)
    power_ratio = calculate_band_power_ratio(freqs, amps, low_hz=4.0, high_hz=6.0)
    
    # Envelope and slope
    envelope = compute_amplitude_envelope(filtered)
    mean_amp = float(np.mean(envelope))
    slope = compute_linear_slope(envelope)
    
    # Prepare serializable spectrum and waveform
    spectrum_pts = [
        FrequencySpectrumPoint(frequency_hz=round(float(f), 2), power=round(float(a), 5))
        for f, a in zip(freqs, amps) if f <= 15.0
    ]
    
    waveform_data = [
        {
            "time_sec": round(float(t), 3),
            "raw_displacement": round(float(r), 4),
            "filtered_displacement": round(float(filt), 4),
            "envelope": round(float(env), 4)
        }
        for t, r, filt, env in zip(t_uniform, disp_uniform, filtered, envelope)
    ]
    
    quality_warning = None
    if effective_fps < 20.0:
        quality_warning = f"Webcam framerate ({effective_fps:.1f} FPS) is below the recommended 20 FPS threshold."
    elif duration_sec < 3.0:
        quality_warning = "Recording is under 3 seconds; frequency resolution is limited."
        
    return TremorAnalysisResponse(
        status="success",
        effective_fps=round(effective_fps, 2),
        duration_seconds=round(duration_sec, 2),
        dominant_frequency_hz=round(dom_freq, 2),
        power_ratio_4_6hz=round(power_ratio, 4),
        mean_amplitude=round(mean_amp, 5),
        amplitude_slope=round(slope, 6),
        frequency_spectrum=spectrum_pts,
        filtered_waveform=waveform_data,
        quality_warning=quality_warning
    )
