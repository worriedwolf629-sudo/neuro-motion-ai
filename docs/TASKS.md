# TASKS.md — Project Task Tracker

> **Tracker Status Guide**:
> - `[ ] Backlog`: Planned, requirements established, not yet started.
> - `[~] In Progress`: Active engineering work underway.
> - `[x] Completed`: Implemented, tested, and verified.
> - `[!] Blocked`: Blocked by external dependency, hardware constraint, or bug.

---

## 1. Core Feature Checklist

| # | Feature | Status | Priority | Primary Files / Components | Next Action |
|---|---------|--------|----------|----------------------------|-------------|
| 1 | **Live Hand Tracking** | `[ ] Backlog` | `P0` | `frontend/src/components/HandTracker.jsx` | Inspect MediaPipe JS vs Python options |
| 2 | **Tremor Measurement** | `[ ] Backlog` | `P0` | `backend/analysis/tremor.py` | Implement coordinate recorder & time-series filter |
| 3 | **Tremor Frequency Analysis** | `[ ] Backlog` | `P0` | `backend/analysis/fft_service.py` | Build SciPy FFT & peak detection with quality guardrails |
| 4 | **Finger-Tapping Detection** | `[ ] Backlog` | `P0` | `backend/analysis/tapping.py` | Implement thumb-to-index Euclidean distance calculator |
| 5 | **Tapping Speed & Amplitude** | `[ ] Backlog` | `P0` | `backend/analysis/tapping.py` | Compute cycle rate, interval, and normalized amplitudes |
| 6 | **Movement Consistency Analysis** | `[ ] Backlog` | `P1` | `backend/analysis/consistency.py` | Calculate coefficient of variation & slope of decay |
| 7 | **Combined Visual Dashboard** | `[ ] Backlog` | `P0` | `frontend/src/views/Dashboard.jsx` | Compose Recharts real-time display & camera stream |
| 8 | **Assessment Report** | `[ ] Backlog` | `P1` | `frontend/src/views/ReportModal.jsx` | Create structured exportable summary with disclaimers |

### Differentiator Features (Post-Core Backlog)
- [ ] **Smart Camera Quality Checker**: Hand bounding check, boundary warnings, FPS jitter monitor.
- [ ] **Session-to-Session Comparison**: LocalStorage history and metric trend charts.

---

## 2. Active Development Board

### 🚀 Backlog (Prioritized)

- [ ] **TASK-001**: Research Repository Deep Dive & License Audit
  - **Owner**: Any (Codex / Antigravity)
  - **Priority**: High (`P0`)
  - **Dependencies**: None
  - **Details**: Clone/inspect `yasnaask/parkscreen` and `arelraptor/UBU-PD-FT-Assessment`. Document exact licences, signal filtering routines, and MediaPipe configurations in `RESEARCH_REFERENCES.md`.
  - **Next Action**: Execute source inspection without copying entire repos.

- [ ] **TASK-002**: Backend Infrastructure Initialization
  - **Owner**: Any
  - **Priority**: High (`P0`)
  - **Dependencies**: TASK-001
  - **Details**: Scaffold FastAPI app in `backend/` with standard CORS, health check endpoint (`/health`), and Pydantic schemas for landmark time-series ingestion.
  - **Next Action**: Create `requirements.txt` and `backend/main.py`.

- [ ] **TASK-003**: Frontend Scaffold (Vite + React + Tailwind)
  - **Owner**: Any
  - **Priority**: High (`P0`)
  - **Dependencies**: None
  - **Details**: Initialize Vite React project in `frontend/`, configure Tailwind CSS adhering to `docs/DESIGN_SYSTEM.md`, create layout shell with header, camera pane, and telemetry panels.
  - **Next Action**: Run Vite initialization in `frontend/`.

- [ ] **TASK-004**: Real-time MediaPipe Hand Tracking Component
  - **Owner**: Any
  - **Priority**: High (`P0`)
  - **Dependencies**: TASK-003
  - **Details**: Embed MediaPipe Hands (via `@mediapipe/camera_utils` & `@mediapipe/hands` or CDN), render 21 landmarks on HTML5 overlay canvas, and output landmark coordinates array with millisecond timestamps.
  - **Next Action**: Prototype `HandTracker` component.

- [ ] **TASK-005**: Tremor Signal Extraction & FFT Frequency Analysis
  - **Owner**: Any
  - **Priority**: High (`P0`)
  - **Dependencies**: TASK-002, TASK-004
  - **Details**: Implement Python analysis service accepting landmark trajectory: detrend signal, apply bandpass filter (0.5–12 Hz), compute FFT / PSD, extract peak frequency and spectral energy.
  - **Next Action**: Write `backend/analysis/tremor.py` and unit tests.

- [ ] **TASK-006**: Finger-Tapping Cycle Segmentation & Kinematics
  - **Owner**: Any
  - **Priority**: High (`P0`)
  - **Dependencies**: TASK-002, TASK-004
  - **Details**: Calculate normalized thumb-to-index tip Euclidean distance ($D_{norm}$), detect extrema (peaks = open, troughs = closed), calculate tapping rate (Hz), mean interval, and amplitude decay over time.
  - **Next Action**: Write `backend/analysis/tapping.py` and unit tests.

- [ ] **TASK-007**: Telemetry Dashboard & Live Recharts Integration
  - **Owner**: Any
  - **Priority**: High (`P0`)
  - **Dependencies**: TASK-004, TASK-005, TASK-006
  - **Details**: Connect frontend to analysis endpoints. Plot live/buffered time-series waveform, FFT spectrum, and kinematic stats in dashboard cards.
  - **Next Action**: Wire Recharts components in `frontend/src/views/Dashboard.jsx`.

- [ ] **TASK-008**: Assessment Summary & PDF/Printable Report Generation
  - **Owner**: Any
  - **Priority**: Medium (`P1`)
  - **Dependencies**: TASK-007
  - **Details**: Generate structured summary report with session timestamp, average metrics, waveform snapshots, and prominent medical disclaimers.
  - **Next Action**: Create report view and print styles.

- [ ] **TASK-009**: Hackathon Demo Polish & Positioning Guidance
  - **Owner**: Any
  - **Priority**: Medium (`P1`)
  - **Dependencies**: TASK-007
  - **Details**: Add visual indicators for camera distance, hand boundary warnings, and 30-second live test countdown.
  - **Next Action**: Polish UX transitions and mobile/laptop responsiveness.

---

### ⏳ In Progress
*(No tasks currently in progress. Ready for Phase 1 kickoff.)*

---

### ✅ Completed
- [x] **TASK-000**: Repository Foundation & AI Collaboration Protocol
  - **Owner**: Google Antigravity
  - **Completed On**: 2026-11-05
  - **Summary**: Established repo skeleton, documentation (`README.md`, `AGENTS.md`, `PROJECT.md`, `TASKS.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `RESEARCH_REFERENCES.md`, `REUSE_AND_ATTRIBUTION.md`, `DESIGN_SYSTEM.md`, `HANDOFF_LOG.md`), git setup, and dual-agent handoff protocols.

---

### 🛑 Blocked
*(None at this stage.)*

