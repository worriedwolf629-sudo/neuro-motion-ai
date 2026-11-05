"""
FastAPI application for NeuroMotion AI Kinematic Analysis Engine.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.telemetry import (
    TremorAnalysisRequest,
    TremorAnalysisResponse,
    FingerTappingRequest,
    FingerTappingResponse
)
from app.modules.tremor.analyzer import analyze_tremor_stream
from app.modules.finger_tapping.analyzer import analyze_finger_tapping_stream

app = FastAPI(
    title="NeuroMotion AI - Kinematic Assessment API",
    description="Explainable motor assessment services (tremor frequency analysis and finger-tapping kinematics)",
    version="1.0.0"
)

# Enable CORS for React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "NeuroMotion AI Kinematics Engine",
        "version": "1.0.0",
        "modules": ["tremor_fft", "finger_tapping_kinematics"]
    }

@app.post("/api/v1/analyze/tremor", response_model=TremorAnalysisResponse)
def analyze_tremor(request: TremorAnalysisRequest):
    try:
        return analyze_tremor_stream(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tremor analysis failed: {str(e)}")

@app.post("/api/v1/analyze/finger-tapping", response_model=FingerTappingResponse)
def analyze_finger_tapping(request: FingerTappingRequest):
    try:
        return analyze_finger_tapping_stream(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Finger-tapping analysis failed: {str(e)}")
