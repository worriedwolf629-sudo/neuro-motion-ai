# DECISIONS.md — Architecture Decision Records (ADRs)

This document tracks foundational architectural and technical decisions for NeuroMotion AI using the standard ADR format.

---

## ADR-001: Strict Exclusion of ML Classifiers and Clinical Diagnostic Predictions

- **Date**: 2026-11-05
- **Status**: Accepted
- **Context**:
  Many AI hackathon projects attempt to train machine learning classifiers (e.g. Random Forest, SVM, or deep neural networks) to predict Parkinson's disease from small, uncurated datasets. In medical assessment, this creates high risks of overfitting, lack of explainability, clinical invalidity, and regulatory violation.
- **Decision**:
  NeuroMotion AI will strictly exclude all machine learning disease classification models and probability prediction scores from the MVP. The platform will exclusively compute deterministic, explainable kinematic metrics (frequency in Hz, tapping rate, amplitude decrement slope) and signal processing telemetry.
- **Alternatives Considered**:
  - Training a small classifier on open tremor datasets: Rejected due to risk of false claims, lack of clinical validity, and failure to provide actionable clinical insight.
- **Consequences**:
  - Eliminates "black box" diagnostic liability.
  - Keeps the hackathon pitch grounded, credible, and defensible before medical judges.
  - Requires clear UI disclaimers stating the system is an observational tool, not a diagnostic engine.

---

## ADR-002: Client-Side MediaPipe Hand Tracking

- **Date**: 2026-11-05
- **Status**: Accepted
- **Context**:
  Webcam frames can either be sent to a Python backend via WebSockets/WebRTC for OpenCV/MediaPipe processing, or processed directly in the client browser using the MediaPipe JavaScript/Wasm library.
- **Decision**:
  Run MediaPipe Hand Landmark extraction directly on the client browser via `@mediapipe/camera_utils` and `@mediapipe/hands` (or `@tensorflow-models/hand-pose-detection`).
- **Alternatives Considered**:
  - Streaming video to FastAPI backend: Rejected because streaming 30 FPS video over local network/websockets creates bandwidth latency, frame dropping, and heavy backend CPU/GPU loads.
- **Consequences**:
  - Zero server-side video transmission; preserves privacy.
  - Eliminates server GPU requirements for demo execution.
  - Only numerical landmark coordinates ($x, y, z$) are buffered or sent to the backend.

---

## ADR-003: Python FastAPI + SciPy for Signal Processing Backend

- **Date**: 2026-11-05
- **Status**: Accepted (Proposed MVP Architecture)
- **Context**:
  Kinematic signal processing (Butterworth filtering, detrending, FFT, peak detection, linear regression) requires robust, well-tested scientific computing libraries.
- **Decision**:
  Implement a lightweight FastAPI micro-service in Python leveraging NumPy and SciPy (`scipy.signal`) to handle complex frequency analysis and kinematic computations.
- **Alternatives Considered**:
  - Pure JavaScript/TypeScript math libraries: Viable for basic FFT, but SciPy offers gold-standard peak prominence, filtering, and interpolation algorithms that are battle-tested in scientific literature.
- **Consequences**:
  - Clean separation of UI rendering and scientific computing.
  - Easy unit testing of mathematical and signal routines using pytest.
  - Can be wrapped into a single command or Dockerfile for easy demo execution.

---

## ADR-004: Anatomical Reference Scaling for Normalization

- **Date**: 2026-11-05
- **Status**: Accepted
- **Context**:
  Raw pixel distances between fingertips vary radically depending on how close the user sits to the webcam. If a user leans in, tapping amplitude appears to double.
- **Decision**:
  Normalize all finger-tapping distance measurements by the instantaneous anatomical distance between Landmark 0 (Wrist) and Landmark 9 (Middle Finger MCP joint).
- **Alternatives Considered**:
  - Fixed pixel thresholds: Fragile and completely dependent on camera resolution and patient positioning.
  - Bounding box scaling: Vulnerable to fingers opening/closing altering the bounding box dimension.
- **Consequences**:
  - Normalized distance is dimensionless and robust to moderate shifts in distance from the camera.
  - Clearly displayed in UI as "Normalized Distance ($D_{norm}$)" rather than arbitrary pixels.

---

## ADR-005: Selective Research Adaptation Over Blind Codebase Merging

- **Date**: 2026-11-05
- **Status**: Accepted
- **Context**:
  Two public research repositories (`yasnaask/parkscreen` and `arelraptor/UBU-PD-FT-Assessment`) offer relevant techniques for tremor and finger-tapping analysis.
- **Decision**:
  We will not clone, vendor, or merge the entire codebases of these repositories into our project. We will selectively inspect their mathematical formulas, landmark indexing, and filter constants, verify their licenses, and adapt only clean, relevant logic with complete attribution in `docs/REUSE_AND_ATTRIBUTION.md`.
- **Alternatives Considered**:
  - Git submodule or vendoring entire third-party directories: Rejected as it introduces dead code, incompatible project structures, and unclear intellectual property boundaries.
- **Consequences**:
  - Clean, auditable, high-quality codebase tailored for hackathon delivery.
  - Complete intellectual property transparency and compliance with research ethics.

---

## ADR-006: Local-First Storage Strategy for Hackathon MVP

- **Date**: 2026-11-05
- **Status**: Accepted
- **Context**:
  Hackathon prototypes often fail during live judging due to database connection errors, cloud credential expirations, or schema migration glitches.
- **Decision**:
  Use local browser storage (IndexedDB / LocalStorage) and in-memory FastAPI session state for the 24-hour MVP. Avoid external SQL/NoSQL databases unless session-to-session comparison specifically demands persistent file exports.
- **Alternatives Considered**:
  - PostgreSQL / Supabase: Adds unnecessary cloud latency and infrastructure fragility for a 24-hour prototype.
- **Consequences**:
  - Rapid setup: `git clone`, `npm install`, `pip install`, run.
  - Zero cloud dependencies during live stage presentations.



## ADR-007: Capture Both Tremor Assessment Phases Before Comparing Them

- **Date**: 2026-11-05
- **Status**: Accepted
- **Context**:
  The report reference includes rest and cognitive-load displacement, envelope, and FFT plots. The existing browser flow recorded only one tremor window, so rendering a second phase from the same samples would misrepresent the measurement.
- **Decision**:
  Record a separate rest window and cognitive-load window, analyze each independently, and compare their measured envelopes and RMS amplitudes only after both are captured. Keep existing top-level Phase 1 result fields for compatibility, while adding nested `phase1` and `phase2` results.
- **Alternatives Considered**:
  - Duplicate Phase 1 data to fill Phase 2 plots: Rejected because it would create false measurements.
  - Show a classifier-derived normal/stress/Parkinson score: Rejected under ADR-001; the product has no validated disease classifier.
- **Consequences**:
  - Tremor assessment requires two recording windows.
  - Older one-phase sessions remain readable and show Phase 2 as unavailable.
  - The report uses descriptive kinematic comparisons only and retains the existing white UI theme.

## ADR-008: Live Readouts Are Measurements, Not Disease Probabilities

- **Date**: 2026-11-05
- **Status**: Accepted
- **Context**: Users asked for a live “chance” or safe/fatal result similar to ParkScreen. NeuroMotion has no clinically validated disease classifier, and the ParkScreen class outputs do not establish calibrated real-world disease probabilities.
- **Decision**: Show live movement amplitude, measured 4–6 Hz signal-power share, tapping kinematics, and sampling quality using the same deterministic analyzer as the final report. Withhold the tremor frequency until at least 3 seconds and 24 FPS are available. Do not show a disease probability, risk score, or safe/fatal label.
- **Consequences**: The live profile stays factual and interpretable; it must retain explanatory labels and must not imply that any individual metric predicts disease.
