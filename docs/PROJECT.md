# PROJECT.md — NeuroMotion AI Specifications

## 1. Executive Summary

**NeuroMotion AI** is an explainable, computer-vision-based motor assessment platform engineered to quantify hand movement characteristics using a standard webcam. By extracting 21 real-time 3D hand landmarks via MediaPipe, the platform captures resting-hand movement oscillations (tremor analysis) and rapid finger-tapping kinematics (bradykinesia/amplitude assessment).

The platform transforms raw visual frames into objective, measurable physical indicators (frequency in Hz, rhythm variability, tap rates, and amplitude decrement) to facilitate remote motor monitoring and session-to-session progress tracking.

---

## 2. Problem Statement

Motor examination remains an essential pillar of neurological assessment, particularly for conditions involving movement disorders. However, conventional assessment presents key friction points:
- **Clinical Subjectivity**: Scoring systems such as the Movement Disorder Society Unified Parkinson's Disease Rating Scale (MDS-UPDRS Part III) rely on visual clinical scoring (0 to 4 scale), which suffers from intra- and inter-observer variability.
- **Access & Mobility Constraints**: Patients experiencing motor deficits often struggle with regular transit to specialized movement disorder clinics.
- **Hardware Prohibitions**: Specialized motion analysis equipment (such as electromagnetic sensors, sensorized gloves, or multi-camera optical mocap systems) costs thousands of dollars and requires complex in-person calibration.
- **The "Black Box" Problem**: Existing experimental AI tools frequently attempt to output a binary "disease prediction score" using deep neural networks, alienating clinicians due to lack of explainability and creating regulatory minefields.

---

## 3. Project Objectives & Solution

NeuroMotion AI solves this by operating as an **objective, explainable kinematic measurement engine** running on standard consumer hardware:

1. **Ubiquitous Accessibility**: Operates directly in modern web browsers using standard consumer webcams (30 FPS).
2. **Deterministic & Explainable Signal Processing**: Replaces opaque deep learning classification with transparent signal processing (Fast Fourier Transform, Butterworth filtering, peak/trough cycle detection).
3. **Dual Assessment Modules**:
   - **Resting Tremor Module**: Quantifies oscillation frequency (Hz) and power spectral density.
   - **Finger-Tapping Module**: Quantifies movement speed (taps/second), rhythm variability, and progressive amplitude decrement (fatigue).
4. **Physician & Patient-Friendly Visualization**: Live kinematic waveforms, dominant frequency spectrums, and downloadable structured assessment reports.

---

## 4. Scope Boundaries & Non-Goals

### What We ARE Building (In-Scope MVP)
- Real-time webcam hand tracking using MediaPipe 21 hand landmarks.
- Resting tremor signal isolation and FFT-based frequency computation (dominant peak in Hz).
- Thumb-index tapping cycle segmentation and tap counting.
- Kinematic metrics: tap frequency, average tap interval, amplitude range, and amplitude fatigue trend.
- Unified healthcare dashboard with live video overlay and telemetry charts.
- Printable / downloadable structured assessment report.
- Signal quality guardrails (framerate detection, landmark loss warnings).

### What We Are NOT Building (Strict Non-Goals)
- **NO Parkinson's Disease Prediction / Classification**: The system will not output phrases like "Parkinson's detected" or "85% probability of tremor disorder".
- **NO Machine Learning Disease Classifiers**: No SVMs, random forests, or neural nets trained to distinguish healthy vs. pathological states in the MVP.
- **NO Clinical Diagnostic Certification**: This is an experimental engineering prototype, not an FDA/CE-cleared medical device.
- **NO Heavy Multi-Tenant EHR/EMR Integration**: For the 24-hour hackathon, data is maintained locally in the active session.
- **NO Invasive Sensor Requisites**: Zero external hardware beyond a standard RGB webcam.

---

## 5. Target Users & Use Cases

1. **Neurologists & Physical Therapists**:
   - Objective kinematic telemetry during telemedicine consultations.
   - Verifiable measurements to complement MDS-UPDRS scoring.
2. **Motor Assessment Researchers**:
   - Transparent, open-source tool for logging hand movement time series.
3. **Individuals Performing Prescribed Home Exercises**:
   - Guided motor assessment with clear positioning feedback and progress tracking over time.

---

## 6. Hackathon Demonstration Strategy (24-Hour Goals)

To deliver an impactful pitch and technical demo within 24 hours:
- **Live 30-Second "Aha!" Moment**:
  1. Presenter holds hand at rest in front of webcam → Tremor module graphs real-time motion and plots dominant frequency spike.
  2. Presenter conducts finger-tapping exercise → Screen captures closing/opening peaks, calculates tap rate, and plots amplitude decay in real time.
- **Visual Distinction**:
  - High-contrast clinical dark-mode dashboard (Space Grotesk + Archivo typography, emerald/cyan accents).
  - Clear overlay of skeletal landmarks on the live camera stream.
- **Transparent Science**:
  - Emphasize to hackathon judges that our value lies in **explainability and reliable kinematic engineering**, avoiding the ungrounded claims of "black box" diagnostic AI.

