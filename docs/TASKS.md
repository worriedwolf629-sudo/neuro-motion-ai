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
| 1 | **Live Hand Tracking** | `[x] Completed` | `P0` | `frontend/src/features/hand-tracking/HandTrackerCanvas.jsx` | Verified 21 landmarks + HUD |
| 2 | **Tremor Measurement** | `[x] Completed` | `P0` | `backend/app/modules/tremor/analyzer.py` | Verified displacement projection |
| 3 | **Tremor Frequency Analysis** | `[x] Completed` | `P0` | `backend/app/modules/signal_processing/filters.py` | Verified FFT & power ratio |
| 4 | **Finger-Tapping Detection** | `[x] Completed` | `P0` | `backend/app/modules/finger_tapping/analyzer.py` | Verified thumb-index tracking |
| 5 | **Tapping Speed & Amplitude** | `[x] Completed` | `P0` | `backend/app/modules/finger_tapping/analyzer.py` | Verified cadence & amplitude |
| 6 | **Movement Consistency Analysis** | `[x] Completed` | `P1` | `backend/app/modules/finger_tapping/analyzer.py` | Verified rhythm CV & decay slope |
| 7 | **Combined Visual Dashboard** | `[x] Completed` | `P0` | `frontend/src/App.jsx`, `TelemetryCharts.jsx` | Verified UI layout matching reference images |
| 8 | **Assessment Report** | `[x] Completed` | `P1` | `frontend/src/App.jsx` (Clinical Summary view) | Verified export layout & medical disclaimer |

### Differentiator Features (Post-Core Backlog)
- [ ] **Smart Camera Quality Checker**: Hand bounding check, boundary warnings, FPS jitter monitor.
- [x] **Account History & Session Comparison**: Supabase Auth, account-scoped Postgres records, recent dashboard table, and metric comparison chart/table. Cloud setup and deployment variables remain operator configuration.

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
- [x] **Exploratory Browser Voice Biomarkers & Triage**: Browser features, quality gates, provisional modality triage, CSV/report output, validation script, and synthetic tests are implemented. Real microphone/webcam cohort validation remains open.
- [~] **Cloud Account Setup**: Frontend and migration are implemented; Supabase project migration, Auth redirect configuration, and deployment environment variables still need project-owner setup.

---

### ✅ Completed
- [x] **TASK-013**: Browser voice biomarkers, quality gates, provisional triage, and reproducible validation
  - **Owner**: OpenAI Codex
  - **Completed On**: 2026-11-06
  - **Summary**: Added local jitter/shimmer/HNR/voiced fraction estimates, explicit per-modality quality checks, explainable provisional triage labels and metric flags, results/report/CSV integration, UCI dataset statistics generator, and independent synthetic engine tests. Reused existing kinematics pipelines and JSONB result persistence; no media upload, ML classifier, or risk score was added.
  - **Research / attribution**: Reviewed MIT-licensed ROC-HCI and `pd-voice-features` references. MotorLens has no license file in its checked public listing; no code was copied. See `docs/REUSE_AND_ATTRIBUTION.md`.
  - **Verification**: `npm test` (6/6 passed), `npm run build` (passed; existing large bundle advisory), `.venv-validation/bin/python scripts/validate_uci_voice.py` (generated `docs/VALIDATION.md`), and `git diff --check` passed.
  - **Remaining limitation**: Synthetic tests and UCI recording-level statistics do not constitute consumer-device or clinical validation; all triage bands remain provisional and `to verify`.
- [x] **TASK-010**: Two-phase tremor report graphs
  - **Owner**: OpenAI Codex
  - **Completed On**: 2026-11-05
  - **Summary**: Added separate rest and cognitive-load captures; report now shows the requested phase displacement, amplitude-envelope comparison, and per-phase FFT graphs on white cards. No diagnostic risk score is used.
  - **Verification**: `npm run build` completed successfully.
- [x] **TASK-011**: Live movement measurement profile
  - **Owner**: OpenAI Codex
  - **Completed On**: 2026-11-05
  - **Summary**: Added a live, 2 Hz readout of tremor amplitude, 4–6 Hz signal-power share, guarded frequency estimate, recording quality, and tapping cadence/amplitude. Values come from the same analysis functions as the report; no disease probability or safety classification is displayed.
  - **Verification**: `npm run build` and `git diff --check`.
- [x] **TASK-012**: Account login and assessment history comparison
  - **Owner**: OpenAI Codex
  - **Completed On**: 2026-11-06
  - **Summary**: Added email one-time-link login, Supabase per-user assessment records protected by RLS, browser-only fallback, recent dashboard records, and historical metric chart/table for tremor, tapping, and voice. Legacy local records are labeled when timestamps or measurements are unavailable.
  - **Verification**: `npm run build` passed for GitHub Pages; `VERCEL=1 npm run build` passed for Vercel; `git diff --check` passed. Vite reports the existing large JavaScript chunk advisory.
- [x] **TASK-000**: Repository Foundation & AI Collaboration Protocol
  - **Owner**: Google Antigravity
  - **Completed On**: 2026-11-05
  - **Summary**: Established repo skeleton, documentation, git setup, and dual-agent handoff protocols.
- [x] **TASK-001**: Research Repository Deep Dive & License Audit
  - **Owner**: Google Antigravity
  - **Completed On**: 2026-11-05
  - **Summary**: Inspected `parkscreen` (MIT) and `UBU-PD-FT-Assessment` (Apache 2.0). Audited signal processing algorithms, fixed displacement projection error, and updated attribution records.
- [x] **TASK-002**: Backend Scaffolding & Kinematic Analysis Modules
  - **Owner**: Google Antigravity
  - **Completed On**: 2026-11-05
  - **Summary**: Created FastAPI backend with Pydantic telemetry models, Butterworth filters, FFT analysis, and finger-tapping kinematics. Verified passing unit tests.
- [x] **TASK-003**: React 19 + Tailwind v4 + Recharts Frontend Architecture
  - **Owner**: Google Antigravity
  - **Completed On**: 2026-11-05
  - **Summary**: Built responsive clinical analytics dashboard inspired by user design references (dark slate, teal/cyan telemetry, HUD camera overlay, waveform & FFT spectrum charts, and printable clinical report). Verified production build.

---

### 🛑 Blocked
*(None at this stage.)*

