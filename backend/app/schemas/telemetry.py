"""
Pydantic schemas for NeuroMotion AI requests, kinematic time-series, and assessment telemetry.
"""
from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class Coordinate3D(BaseModel):
    x: float
    y: float
    z: float = 0.0

class LandmarkSample(BaseModel):
    timestamp_ms: float = Field(..., description="High precision millisecond timestamp")
    landmarks: List[Coordinate3D] = Field(..., description="Array of 21 3D MediaPipe landmarks")

class TremorAnalysisRequest(BaseModel):
    samples: List[LandmarkSample] = Field(..., description="Series of landmark frames recorded during rest")
    tracking_landmark_idx: int = Field(8, description="Target landmark index (default: 8 - Index Fingertip)")
    target_fs: float = Field(30.0, description="Nominal sampling rate in Hz")

class FrequencySpectrumPoint(BaseModel):
    frequency_hz: float
    power: float

class TremorAnalysisResponse(BaseModel):
    status: str
    effective_fps: float
    duration_seconds: float
    dominant_frequency_hz: float
    power_ratio_4_6hz: float
    mean_amplitude: float
    amplitude_slope: float
    frequency_spectrum: List[FrequencySpectrumPoint]
    filtered_waveform: List[Dict[str, float]]
    quality_warning: Optional[str] = None

class FingerTappingRequest(BaseModel):
    samples: List[LandmarkSample] = Field(..., description="Series of landmark frames during tapping")
    target_fs: float = Field(30.0, description="Target sample rate")

class TapCycleInfo(BaseModel):
    tap_index: int
    open_time_sec: float
    close_time_sec: float
    interval_sec: float
    normalized_amplitude: float

class FingerTappingResponse(BaseModel):
    status: str
    total_taps: int
    effective_fps: float
    duration_seconds: float
    taps_per_second: float
    average_interval_sec: float
    interval_variability_cv: float
    average_amplitude: float
    amplitude_slope: float
    cycles: List[TapCycleInfo]
    distance_timeseries: List[Dict[str, float]]
    quality_warning: Optional[str] = None

class ComprehensiveSessionSummary(BaseModel):
    session_id: str
    timestamp: str
    tremor: Optional[TremorAnalysisResponse] = None
    tapping: Optional[FingerTappingResponse] = None
    medical_disclaimer: str = (
        "NeuroMotion AI is an experimental motor-assessment prototype, not a medical or diagnostic system. "
        "All measurements are kinematic telemetry and signal processing observations."
    )

