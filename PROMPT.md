# PROMPT.md — Persistent AI Work Log

This file tracks significant AI-assisted engineering sessions, architecture shifts, algorithmic implementations, and handoffs between **OpenAI Codex** and **Google Antigravity**.

> **Logging Policy**:
> Do not record trivial single-line queries or conversational chatter.
> Only record tasks that alter project state, create or refactor modules, introduce algorithmic logic, execute test runs, or execute formal agent handoffs.

---

## Log Entries

### Entry 005: Browser-Local Voice Signal Task
- **Date and time**: 2026-11-05
- **Agent**: OpenAI Codex
- **Task**: Integrate the previously prototyped microphone feature into NeuroMotion AI without adding a disease classifier.
- **Objective**: Provide a five-second sustained-vowel capture, descriptive pitch/amplitude metrics, a signal plot, and downloadable CSV while keeping audio local and short-lived.
- **Files modified**:
  - `frontend/src/features/voice/voiceFeatures.js`
  - `frontend/src/pages/VoiceAssessment.jsx`
  - `frontend/src/App.jsx`
  - `frontend/src/pages/AssessmentSelection.jsx`
  - `frontend/src/pages/LandingPage.jsx`
  - `frontend/src/pages/AboutMethodology.jsx`
  - `frontend/src/components/Sidebar.jsx`
  - `README.md`
  - `docs/ARCHITECTURE.md`
  - `docs/DECISIONS.md`
  - `docs/TASKS.md`
  - `PROMPT.md`
  - `docs/HANDOFF_LOG.md`
- **Implementation summary**: User-initiated browser `MediaRecorder` capture is decoded in memory; short-window autocorrelation estimates pitch and RMS windows summarize amplitude variation. The recording is released after processing. No backend, upload, persistence, classifier, probability, or diagnosis is involved.
- **Verification**: Installed locked packages with `npm ci` (0 vulnerabilities); `npm run build` succeeded. Vite reports its existing large-chunk advisory. `git diff --check` passed. Live microphone access was not verified.
- **Remaining work**: Test microphone capture on HTTPS or localhost and publish the changes to update GitHub Pages.

### Entry 001: Repository Foundation & AI Collaboration Protocol
- **Date and time**: 2026-11-05 16:30 UTC
- **Agent**: Google Antigravity
- **Task**: Establish GitHub project foundation, documentation suite, and dual-agent collaboration protocols.
- **Objective**: Create a robust, self-describing repository structure that enables seamless context switching between OpenAI Codex and Google Antigravity without loss of state.
- **Files inspected**:
  - Initial workspace configuration and environment flags.
- **Files created or modified**:
  - `README.md`: Project identity, problem statement, core feature inventory, proposed stack, medical disclaimers.
  - `AGENTS.md`: Permanent engineering rules, strict prohibitions (no ML classifiers/diagnostics), context-switching rituals.
  - `PROMPT.md`: Persistent work log initialized.
  - `.gitignore`: Comprehensive exclusion list for Python, Node, Vite, OS files, and session captures.
  - `.env.example`: Environment variable templates for frontend and backend.
  - `docs/PROJECT.md`: Comprehensive product spec, clinical limitations, and MVP boundaries.
  - `docs/TASKS.md`: Feature checklist, backlog, in-progress, completed, and blocked tracker.
  - `docs/ARCHITECTURE.md`: Data flow, coordinate normalization, signal processing pipeline, API contracts.
  - `docs/DECISIONS.md`: Architecture Decision Records (ADRs 001–006).
  - `docs/RESEARCH_REFERENCES.md`: Technical analysis framework for `parkscreen` and `UBU-PD-FT-Assessment`.
  - `docs/REUSE_AND_ATTRIBUTION.md`: Attribution registry and legal compliance table.
  - `docs/DESIGN_SYSTEM.md`: UI/UX design tokens, typography, telemetry dashboard layout.
  - `docs/HANDOFF_LOG.md`: Chronological handoff ledger and handoff templates.
  - Folder placeholders: `frontend/.gitkeep`, `backend/.gitkeep`, `research/.gitkeep`, `assets/.gitkeep`.
- **Implementation summary**:
  - Initialized clean git repository with `main` branch.
  - Formulated strict separation between explainable kinematic metrics (Hz, tap count, amplitude decrement) and clinical diagnosis.
  - Built an airtight context-switching protocol for Codex and Antigravity.
- **Tests performed**:
  - Validated internal markdown link consistency across `docs/` and root files.
  - Checked directory hierarchy against task specifications.
- **Test results**: All foundation files successfully created and verified.
- **Known issues**: None at the foundation phase. No code implemented yet.
- **Remaining work**:
  - Inspect public repositories (`parkscreen`, `UBU-PD-FT-Assessment`) for licence terms and specific algorithmic nuances before implementing.
  - Bootstrap backend (FastAPI, NumPy, SciPy) and frontend (React, Vite, Tailwind).
### Entry 002: Research Integration, Kinematic Engine, and Clinical Dashboard
- **Date and time**: 2026-11-05 19:22 UTC
- **Agent**: Google Antigravity
- **Task**: Deep-dive audit of `parkscreen` and `UBU-PD-FT-Assessment`, backend kinematics implementation, and React clinical analytics dashboard.
- **Objective**: Deliver a demonstrable, end-to-end motor assessment application without ML classification, styled per healthcare reference designs.
- **Files inspected**:
  - `parkscreen/signal_processing.py`, `features.py`, `tracker.py`
  - `ubu/lib/extract_features.py`, `video_processing.py`, `LICENSE`
- **Files created or modified**:
  - `backend/app/main.py`: FastAPI server with `/health`, `/api/v1/analyze/tremor`, `/api/v1/analyze/finger-tapping`.
  - `backend/app/schemas/telemetry.py`: Pydantic telemetry models and validation schemas.
  - `backend/app/modules/signal_processing/filters.py`: Resampling, zero-phase Butterworth filter, FFT, Hilbert envelope, and linear regression slope.
  - `backend/app/modules/tremor/analyzer.py`: Tremor displacement projection and FFT power spectral analysis.
  - `backend/app/modules/finger_tapping/analyzer.py`: Anatomically normalized thumb-index distance, peak/trough cycle detection, cadence, CV rhythm variability, and fatigue decay.
  - `backend/tests/test_kinematics.py`: Comprehensive pytest test suite for synthetic 5 Hz tremor and 2.5 Hz finger tapping.
  - `backend/pytest.ini`, `backend/requirements.txt`: Virtualenv and test setup.
  - `frontend/src/App.jsx`: Main clinical dashboard inspired by user reference layouts (sidebar, stat telemetry cards, live camera + protocol guides, waveform/FFT analytics, and printable clinical report).
  - `frontend/src/features/hand-tracking/HandTrackerCanvas.jsx`: 21-point MediaPipe hand skeleton overlay with FPS meter and landmark tracking status.
  - `frontend/src/features/dashboard/TelemetryCharts.jsx`: Recharts waveforms, FFT spectrum with 4-6 Hz band highlight, and cycle progression.
  - `frontend/src/index.css`, `frontend/vite.config.js`, `frontend/package.json`: Vite + Tailwind CSS bundle configuration.
  - `docs/TASKS.md`, `docs/REUSE_AND_ATTRIBUTION.md`, `docs/HANDOFF_LOG.md`: Documentation synchronization.
- **Implementation summary**:
  - Identified and fixed critical flaw in naive Euclidean norm tremor displacement by projecting along the principal variance axis to preserve fundamental frequency $f_0$.
  - Incorporated anatomical scaling $S_{ref} = \text{Wrist-to-MCP}$ to achieve distance-invariant finger tapping amplitude.
  - Successfully built production frontend bundle and executed passing pytest unit tests.
- **Tests performed**:
  - `pytest -v tests/`: 2/2 passed (5.0 Hz tremor oscillation and 2.5 Hz finger tapping kinematics).
  - `npm run build`: Vite bundle built in 342ms with 0 errors.
- **Test results**: All tests passed.
- **Remaining work**: Live camera integration validation and optional local storage persistence.
- **Next recommended action**: Start development servers (`uvicorn app.main:app` and `npm run dev`) to test live with webcam.



### Entry 003: Two-Phase Tremor Assessment Report
- **Date and time**: 2026-11-05
- **Agent**: OpenAI Codex
- **Task**: Match the uploaded hand-tremor reference report while preserving the existing white theme.
- **Objective**: Capture valid independent rest and cognitive-load measurements and render each requested graph name and signal series without inventing diagnostic classifications.
- **Files modified**:
  - `frontend/src/pages/LiveAssessment.jsx`
  - `frontend/src/pages/AssessmentResults.jsx`
  - `docs/ARCHITECTURE.md`
  - `docs/DECISIONS.md`
  - `docs/TASKS.md`
  - `PROMPT.md`
  - `docs/HANDOFF_LOG.md`
- **Implementation**: Added sequential two-phase tremor capture, independent phase FFT/waveform plots, envelope comparison, and support for older one-phase stored sessions. Kept all graph surfaces white. Left out the reference's disease-risk category and score because the project does not implement a validated diagnostic classifier.
- **Verification**: `npm ci` succeeded with 0 reported vulnerabilities. `npm run build` succeeded; Vite emitted its existing large-chunk advisory. `git diff --check` passed.
- **Remaining work**: Publish the changes and exercise the two-phase flow with a fresh recording.


### Entry 004: Non-Diagnostic Cognitive-Load Summary Panel
- **Date and time**: 2026-11-05
- **Agent**: OpenAI Codex
- **Task**: Match the uploaded report's lower summary area without presenting ParkScreen's classifier output.
- **Objective**: Show NeuroMotion's real two-phase RMS amplitude comparison in the unchanged white theme.
- **Files modified**: `frontend/src/pages/AssessmentResults.jsx`, `PROMPT.md`, `docs/HANDOFF_LOG.md`.
- **Implementation**: Added a relative amplitude bar, measured phase values, and Phase 2 / Phase 1 RMS ratio. It contains no class percentages, disease label, or risk score.
- **Verification**: `npm run build` succeeded; `git diff --check` passed. Existing Vite large-chunk advisory remains.
- **Research note**: ParkScreen's `visualizer.py` plots classifier probabilities and `risk_score`; `classifier.py` uses SVC `predict_proba`; README states the training data is simulated rather than clinical.
### Entry 004: Live Descriptive Movement Profile
- **Date and time**: 2026-11-05
- **Agent**: OpenAI Codex
- **Task**: Add a live measurement indicator requested in place of an unsupported disease-probability gauge.
- **Files modified**: `frontend/src/pages/LiveAssessment.jsx`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/TASKS.md`, `docs/HANDOFF_LOG.md`, `PROMPT.md`.
- **Implementation**: Reuses the existing deterministic analyzers for a 2 Hz live readout. Tremor frequency is withheld until 3 seconds and 24 FPS are present. White UI colors are preserved.
- **Verification**: `npm run build`; `git diff --check`.
- **Limit**: Readouts describe captured movement and sampling only; they are not disease chances or a safety assessment.
