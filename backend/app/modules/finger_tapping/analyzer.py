"""
Finger-Tapping kinematic analysis module.
Adapts thumb-index distance and peak segmentation from UBU-PD-FT-Assessment,
adding anatomical normalization, peak/trough validation, rhythm variability, and amplitude fatigue regression.
"""
import numpy as np
from scipy.signal import find_peaks
from app.schemas.telemetry import FingerTappingRequest, FingerTappingResponse, TapCycleInfo
from app.modules.signal_processing.filters import (
    resample_to_uniform_grid,
    butter_lowpass_filter,
    compute_linear_slope
)

def analyze_finger_tapping_stream(request: FingerTappingRequest) -> FingerTappingResponse:
    if len(request.samples) < 15:
        return FingerTappingResponse(
            status="insufficient_data",
            total_taps=0,
            effective_fps=0.0,
            duration_seconds=0.0,
            taps_per_second=0.0,
            average_interval_sec=0.0,
            interval_variability_cv=0.0,
            average_amplitude=0.0,
            amplitude_slope=0.0,
            cycles=[],
            distance_timeseries=[],
            quality_warning="Insufficient frames for finger-tapping analysis."
        )
        
    timestamps = np.array([s.timestamp_ms for s in request.samples], dtype=float)
    duration_sec = (timestamps[-1] - timestamps[0]) / 1000.0
    effective_fps = len(timestamps) / max(0.1, duration_sec)
    
    # Calculate Thumb Tip (4) to Index Tip (8) distance
    # and normalize by Wrist (0) to Middle MCP (9) reference hand scale
    norm_distances = []
    for s in request.samples:
        lm = s.landmarks
        if len(lm) >= 10:
            thumb = np.array([lm[4].x, lm[4].y, lm[4].z])
            index = np.array([lm[8].x, lm[8].y, lm[8].z])
            wrist = np.array([lm[0].x, lm[0].y, lm[0].z])
            middle_mcp = np.array([lm[9].x, lm[9].y, lm[9].z])
            
            d_thumb_index = np.linalg.norm(thumb - index)
            hand_scale = np.linalg.norm(wrist - middle_mcp)
            
            if hand_scale > 0.02:
                norm_d = d_thumb_index / hand_scale
            else:
                norm_d = d_thumb_index
        else:
            norm_d = 0.0
        norm_distances.append(norm_d)
        
    norm_distances = np.array(norm_distances)
    
    # Uniform interpolation
    target_fs = max(20.0, min(60.0, request.target_fs))
    t_uniform, d_uniform = resample_to_uniform_grid(timestamps, norm_distances, target_fs=target_fs)
    
    # Lowpass filter to remove landmark jitter
    smoothed_d = butter_lowpass_filter(d_uniform, cutoff=8.0, fs=target_fs)
    
    # Peak finding (peaks represent maximum finger openings)
    # Minimum distance of ~0.25 seconds between taps
    min_dist_samples = max(2, int(target_fs * 0.22))
    peak_indices, properties = find_peaks(
        smoothed_d,
        distance=min_dist_samples,
        prominence=0.08
    )
    
    # Trough finding (closure points between openings)
    trough_indices, _ = find_peaks(
        -smoothed_d,
        distance=min_dist_samples,
        prominence=0.05
    )
    
    total_taps = len(peak_indices)
    cycles = []
    intervals = []
    peak_amplitudes = []
    
    for i, p_idx in enumerate(peak_indices):
        peak_time = float(t_uniform[p_idx])
        peak_amp = float(smoothed_d[p_idx])
        peak_amplitudes.append(peak_amp)
        
        # Associated closure trough (closest preceding or subsequent)
        close_time = peak_time
        matching_troughs = [t_idx for t_idx in trough_indices if t_idx > p_idx]
        if matching_troughs:
            close_time = float(t_uniform[matching_troughs[0]])
            
        interval = 0.0
        if i > 0:
            prev_peak_time = float(t_uniform[peak_indices[i-1]])
            interval = peak_time - prev_peak_time
            intervals.append(interval)
            
        cycles.append(TapCycleInfo(
            tap_index=i + 1,
            open_time_sec=round(peak_time, 3),
            close_time_sec=round(close_time, 3),
            interval_sec=round(interval, 3),
            normalized_amplitude=round(peak_amp, 4)
        ))
        
    # Kinematic aggregate metrics
    taps_per_sec = float(total_taps / max(1.0, duration_sec))
    avg_interval = float(np.mean(intervals)) if intervals else 0.0
    
    # Rhythm variability: Coefficient of Variation (CV) = (std / mean) * 100%
    if len(intervals) >= 2 and avg_interval > 0:
        cv = float((np.std(intervals) / avg_interval) * 100.0)
    else:
        cv = 0.0
        
    avg_amp = float(np.mean(peak_amplitudes)) if peak_amplitudes else 0.0
    amp_slope = compute_linear_slope(np.array(peak_amplitudes)) if len(peak_amplitudes) >= 3 else 0.0
    
    # Timeseries for Recharts
    timeseries_data = [
        {
            "time_sec": round(float(t), 3),
            "raw_distance": round(float(r), 4),
            "smoothed_distance": round(float(s), 4),
            "is_peak": 1 if idx in peak_indices else 0
        }
        for idx, (t, r, s) in enumerate(zip(t_uniform, d_uniform, smoothed_d))
    ]
    
    quality_warning = None
    if effective_fps < 20.0:
        quality_warning = f"Camera framerate ({effective_fps:.1f} FPS) is low. Tap detection accuracy may be affected."
    elif total_taps < 3:
        quality_warning = "Fewer than 3 completed taps detected. Tap vigorously to capture full cycles."
        
    return FingerTappingResponse(
        status="success",
        total_taps=total_taps,
        effective_fps=round(effective_fps, 2),
        duration_seconds=round(duration_sec, 2),
        taps_per_second=round(taps_per_sec, 2),
        average_interval_sec=round(avg_interval, 3),
        interval_variability_cv=round(cv, 1),
        average_amplitude=round(avg_amp, 4),
        amplitude_slope=round(amp_slope, 5),
        cycles=cycles,
        distance_timeseries=timeseries_data,
        quality_warning=quality_warning
    )

