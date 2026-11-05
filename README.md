# NeuroMotion AI

[![Project Status: Planned / Foundation Phase](https://img.shields.io/badge/status-foundation%20phase-yellow.svg)](#current-development-status)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](#important-medical-disclaimer)
[![Hackathon: 24-Hour Healthcare Hackathon](https://img.shields.io/badge/event-healthcare%20hackathon-red.svg)](#project-overview)

An explainable, computer-vision-based motor assessment platform that uses standard webcam hand tracking to quantify movement characteristics through resting-hand tremor analysis and finger-tapping assessment.

The platform aims to make guided motor assessments accessible, visualise measurable movement characteristics, and support session-to-session progress monitoring without specialized sensor hardware.

---

## ⚠️ Important Medical Disclaimer

> **NEUROMOTION AI IS AN EXPERIMENTAL MOTOR-ASSESSMENT PROTOTYPE, NOT A DIAGNOSTIC SYSTEM.**
>
> This software is created solely for research, demonstration, and algorithmic benchmarking during a 24-hour hackathon. 
> 
> - **We are NOT building a Parkinson's disease prediction model or classifier.**
> - **We are NOT calculating disease probabilities or clinical diagnostic scores.**
> - **This platform has NOT been clinically validated.**
> - No machine learning classification models are used to label health conditions.
> - The software provides objective kinematic and signal-processing measurements (e.g. movement frequency in Hz, tapping intervals, amplitude decay). These numerical observations must never be used as a substitute for professional clinical judgment, neurological examination, or medical diagnosis.

---

## The Problem

Traditional clinical assessments of motor impairments (such as resting tremor and bradykinesia) rely primarily on in-person observational rating scales (e.g., MDS-UPDRS Part III). These evaluations face significant barriers:
1. **Subjectivity & Inter-rater Variability**: Visual estimation of tremor frequency or subtle amplitude decrement is difficult to standardize across practitioners.
2. **Infrequent Monitoring**: Patients often experience fluctuations throughout the day, yet clinical check-ups happen months apart.
3. **Hardware Barriers**: Sensor-based solutions (accelerometers, gyroscopic gloves) are costly, require calibration, and are rarely available for home monitoring.

## Proposed Solution

NeuroMotion AI leverages ubiquitously available webcams and computer vision to deliver:
- **Zero-hardware-overhead Motor Assessment**: Standard RGB camera hand tracking with real-time MediaPipe hand landmark extraction.
- **Explainable Kinematic Metrics**: Algorithmic signal extraction (time-series coordinates, FFT power spectral density, peak detection) providing transparent physical units (Hz, normalized amplitude, tap intervals).
- **Interactive Visual Dashboard**: Real-time feedback, movement consistency trends, and exportable session summaries.

---

## Core Features (Planned)

| # | Feature | Description | Status |
|---|---------|-------------|--------|
| 1 | **Live Hand Tracking** | Real-time 21-landmark MediaPipe tracking, skeleton overlay, bounding box, tracking confidence check | `Planned` |
| 2 | **Tremor Measurement** | Resting-hand landmark position capture over time, coordinate timestamping, oscillation isolation | `Planned` |
| 3 | **Tremor Frequency Analysis** | FFT-based spectral analysis, dominant frequency identification (Hz), signal-quality guardrails | `Planned` |
| 4 | **Finger-Tapping Detection** | Thumb-to-index distance tracking, cycle segmentation, completed tap counting | `Planned` |
| 5 | **Tapping Speed & Amplitude** | Taps/second, mean interval, amplitude range (pixel vs. normalized hand scale) | `Planned` |
| 6 | **Movement Consistency Analysis**| Interval variance, amplitude fatigue/decay detection, rhythm stability | `Planned` |
| 7 | **Combined Visual Dashboard** | Unified hackathon-ready UI with live video, waveform graphs, spectrum, and summary telemetry | `Planned` |
| 8 | **Assessment Report** | Structured summary report with metrics, graphs, session context, and medical disclaimers | `Planned` |

### Future Product Differentiators (Post-Core Backlog)
- **Smart Camera Quality Checker**: Hand visibility boundaries, jitter detection, and real-time positioning feedback.
- **Session-to-Session Comparison**: Trend charts tracking metrics across multiple sessions with environmental warning indicators.

---

## Proposed Technology Stack

> *Note: The stack below is the proposed architecture for the prototype and is subject to refinement during technical prototyping. See [ARCHITECTURE.md](docs/ARCHITECTURE.md) and [DECISIONS.md](docs/DECISIONS.md).*

- **Frontend**: React 18+, Vite, Tailwind CSS
- **Visualization**: Recharts / HTML5 Canvas
- **Computer Vision**: MediaPipe Hands (JavaScript / Python), WebRTC / MediaDevices API
- **Signal Processing & Backend**: Python 3.10+, FastAPI, NumPy, SciPy (FFT & signal filtering)
- **Storage**: Lightweight local session storage (JSON/Local-First), keeping MVP deployment simple

### High-Level Data Flow

```
Webcam (Browser)
       │
       ▼
React Frontend + MediaPipe Hand Tracking (21 3D Landmarks)
       │
       ▼ [Landmark Coordinates + Microsecond Timestamps]
Python Analysis Service (FastAPI)
       ├─► Signal Filtering & Normalization
       ├─► Tremor Oscillations & FFT Spectral Analysis (Dominant Peak Hz)
       ├─► Finger-Tapping Peak/Valley Segmentation & Interval Counting
       └─► Consistency & Amplitude Fatigue Calculation
       │
       ▼ [Structured JSON Metric Payload]
React Unified Dashboard & Assessment Report Generator
```

---

## Current Development Status

- **Phase**: **Foundation & Architecture Setup**
- **Implemented Features**: None (0/8 core features). Repository structure, guidelines, agent workflow protocols, and reference research tracking are established.
- **Next Milestone**: Research repository inspection & technical prototyping of hand tracking pipeline.

---

## Setup Instructions (Placeholder)

*Detailed setup scripts will be provided as implementation begins.*

### Prerequisites
- Node.js (v18+) & npm / yarn
- Python 3.10+ & virtualenv
- Webcam access via a modern browser (Chrome / Edge recommended for MediaPipe WebGL acceleration)

```bash
# Clone the repository
git clone https://github.com/<org>/neuro-motion-ai.git
cd neuro-motion-ai

# Backend setup (Planned)
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend setup (Planned)
cd ../frontend
npm install
npm run dev
```


