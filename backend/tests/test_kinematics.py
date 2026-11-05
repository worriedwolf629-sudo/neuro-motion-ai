import numpy as np
import pytest
from app.schemas.telemetry import (
    TremorAnalysisRequest,
    LandmarkSample,
    Coordinate3D,
    FingerTappingRequest
)
from app.modules.tremor.analyzer import analyze_tremor_stream
from app.modules.finger_tapping.analyzer import analyze_finger_tapping_stream

def test_tremor_synthetic_oscillation():
    # Generate 5 seconds of 5.0 Hz oscillation (typical tremor frequency)
    fs = 30.0
    duration = 5.0
    n = int(fs * duration)
    t = np.linspace(0, duration, n)
    freq = 5.0
    signal = 0.05 * np.sin(2 * np.pi * freq * t)
    
    samples = []
    for i in range(n):
        lms = [Coordinate3D(x=0.5, y=0.5, z=0.0) for _ in range(21)]
        # Add oscillation to index tip (landmark 8)
        lms[8] = Coordinate3D(x=0.5 + signal[i], y=0.5 + signal[i], z=0.0)
        samples.append(LandmarkSample(timestamp_ms=float(t[i] * 1000.0), landmarks=lms))
        
    req = TremorAnalysisRequest(samples=samples, tracking_landmark_idx=8, target_fs=30.0)
    res = analyze_tremor_stream(req)
    
    assert res.status == "success"
    # Dominant frequency should be close to 5.0 Hz (within 0.5 Hz resolution)
    assert abs(res.dominant_frequency_hz - 5.0) <= 0.6
    assert res.power_ratio_4_6hz > 0.4
    assert len(res.frequency_spectrum) > 0

def test_finger_tapping_cycle_detection():
    # Simulate 10 tapping cycles over 4 seconds (~2.5 taps per second)
    fs = 30.0
    duration = 4.0
    n = int(fs * duration)
    t = np.linspace(0, duration, n)
    
    # 2.5 Hz opening/closing motion
    tap_motion = 0.15 + 0.12 * (1.0 - np.cos(2 * np.pi * 2.5 * t))
    
    samples = []
    for i in range(n):
        lms = [Coordinate3D(x=0.5, y=0.5, z=0.0) for _ in range(21)]
        # Wrist at (0.5, 0.8), Middle MCP at (0.5, 0.5) => hand scale ~ 0.3
        lms[0] = Coordinate3D(x=0.5, y=0.8, z=0.0)
        lms[9] = Coordinate3D(x=0.5, y=0.5, z=0.0)
        
        # Thumb at (0.45, 0.4), Index at (0.45 + tap_motion[i], 0.4)
        lms[4] = Coordinate3D(x=0.45, y=0.4, z=0.0)
        lms[8] = Coordinate3D(x=0.45 + float(tap_motion[i]), y=0.4, z=0.0)
        samples.append(LandmarkSample(timestamp_ms=float(t[i] * 1000.0), landmarks=lms))
        
    req = FingerTappingRequest(samples=samples, target_fs=30.0)
    res = analyze_finger_tapping_stream(req)
    
    assert res.status == "success"
    # Expect ~9-11 detected taps
    assert 8 <= res.total_taps <= 12
    assert abs(res.taps_per_second - 2.5) <= 0.6
    assert res.average_amplitude > 0.0

