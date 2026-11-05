"""
Signal processing utilities adapted and improved from scientific signal analysis:
- Timestamp-based uniform resampling for webcam jitter
- Zero-phase Butterworth bandpass/lowpass filtering
- Fast Fourier Transform (FFT) and Power Spectral Density
- Peak detection and Hilbert envelope extraction
"""
import numpy as np
from scipy.signal import butter, filtfilt, hilbert
from scipy.fft import rfft, rfftfreq

def resample_to_uniform_grid(timestamps_ms: np.ndarray, signal: np.ndarray, target_fs: float = 30.0):
    """
    Interpolate variable-rate webcam timestamps to a strictly uniform sampling grid.
    Prevents FFT spectral leakage and frequency warping caused by frame drops.
    """
    if len(timestamps_ms) < 2:
        return np.array([]), np.array([])
    
    t_sec = (timestamps_ms - timestamps_ms[0]) / 1000.0
    total_duration = t_sec[-1]
    
    num_samples = int(np.floor(total_duration * target_fs))
    if num_samples < 5:
        return t_sec, signal
        
    uniform_t = np.linspace(0, total_duration, num_samples, endpoint=False)
    uniform_signal = np.interp(uniform_t, t_sec, signal)
    
    return uniform_t, uniform_signal

def butter_bandpass_filter(data: np.ndarray, lowcut: float = 0.5, highcut: float = 12.0, fs: float = 30.0, order: int = 4) -> np.ndarray:
    """
    Apply zero-phase Butterworth bandpass filter.
    Removes low-frequency baseline drift (<0.5 Hz) and high-frequency camera noise (>12 Hz).
    """
    nyq = 0.5 * fs
    low = max(0.01, lowcut / nyq)
    high = min(0.99, highcut / nyq)
    if low >= high:
        return data
        
    b, a = butter(order, [low, high], btype='band')
    return filtfilt(b, a, data)

def butter_lowpass_filter(data: np.ndarray, cutoff: float = 8.0, fs: float = 30.0, order: int = 4) -> np.ndarray:
    """
    Apply zero-phase Butterworth lowpass filter.
    """
    nyq = 0.5 * fs
    normal_cutoff = min(0.99, cutoff / nyq)
    b, a = butter(order, normal_cutoff, btype='low')
    return filtfilt(b, a, data)

def compute_fft_spectrum(signal: np.ndarray, fs: float = 30.0) -> tuple[np.ndarray, np.ndarray]:
    """
    Compute single-sided FFT amplitude spectrum.
    """
    n = len(signal)
    if n < 2:
        return np.array([]), np.array([])
    freqs = rfftfreq(n, d=1.0 / fs)
    amplitudes = np.abs(rfft(signal)) * (2.0 / n)
    return freqs, amplitudes

def extract_dominant_frequency(freqs: np.ndarray, amplitudes: np.ndarray, f_min: float = 1.0, f_max: float = 14.0) -> tuple[float, float]:
    """
    Find dominant frequency component in physiological frequency range.
    """
    mask = (freqs >= f_min) & (freqs <= f_max)
    if not mask.any():
        return 0.0, 0.0
    valid_freqs = freqs[mask]
    valid_amps = amplitudes[mask]
    max_idx = np.argmax(valid_amps)
    return float(valid_freqs[max_idx]), float(valid_amps[max_idx])

def calculate_band_power_ratio(freqs: np.ndarray, amplitudes: np.ndarray, low_hz: float = 4.0, high_hz: float = 6.0) -> float:
    """
    Compute ratio of spectral power inside band (e.g. 4-6 Hz) relative to total power.
    """
    total_power = np.sum(amplitudes ** 2) + 1e-9
    mask = (freqs >= low_hz) & (freqs <= high_hz)
    band_power = np.sum(amplitudes[mask] ** 2)
    return float(band_power / total_power)

def compute_amplitude_envelope(signal: np.ndarray) -> np.ndarray:
    """
    Compute analytic signal amplitude envelope using the Hilbert transform.
    """
    return np.abs(hilbert(signal))

def compute_linear_slope(y: np.ndarray) -> float:
    """
    Compute linear regression slope across time series points.
    Negative slope indicates progressive amplitude decrement/fatigue.
    """
    if len(y) < 2:
        return 0.0
    x = np.arange(len(y), dtype=float)
    slope, _ = np.polyfit(x, y, 1)
    return float(slope)

