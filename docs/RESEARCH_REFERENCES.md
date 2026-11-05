# RESEARCH_REFERENCES.md — Research Repositories Analysis Framework

This document tracks the technical investigation, licence verification, and planned architectural adaptations of the two primary research repositories.

> **CRITICAL POLICY**:
> - Do not copy-paste code wholesale.
> - Do not claim invention of existing signal processing methods.
> - All claims below must be verified against actual repository source code before implementation.

---

## Repository 1: Parkscreen

- **Repository URL**: [https://github.com/yasnaask/parkscreen](https://github.com/yasnaask/parkscreen)
- **Primary Focus**: Webcam-based hand tracking, resting tremor measurement, signal processing, and FFT frequency extraction.
- **Licence Status**: *Pending inspection / audit* (Must verify whether MIT, Apache 2.0, GPL, or non-commercial research licence).

### Key Technical Areas to Investigate:
1. **Landmark Selection for Tremor**:
   - Which specific MediaPipe landmarks are tracked to capture tremor oscillations? (e.g., Landmark 0 Wrist vs. Landmark 5 Index MCP vs. Landmark 12 Middle Tip).
2. **Signal Filtering Pipeline**:
   - Filter type (Butterworth vs Chebyshev), cutoff frequencies (e.g. 0.5 Hz highpass to remove drift, 10–12 Hz lowpass to remove high-frequency camera noise).
3. **FFT Parameterization**:
   - Windowing function used (Hanning, Hamming, or Rectangular).
   - Frequency bin resolution ($\Delta f = f_s / N$).
   - Method for isolating the dominant physiological tremor peak (typically 3–7 Hz for Parkinsonian resting tremor).
4. **Known Limitations to Improve in NeuroMotion AI**:
   - Robustness to variable camera framerates (interpolation/resampling needed).
   - Separation of camera movement / bodily posture shifts from pure hand tremor.

---

## Repository 2: UBU-PD-FT-Assessment

- **Repository URL**: [https://github.com/arelraptor/UBU-PD-FT-Assessment](https://github.com/arelraptor/UBU-PD-FT-Assessment)
- **Primary Focus**: MediaPipe hand landmarks, finger-tapping detection, thumb-index distance kinematics, tapping speed and amplitude decay.
- **Licence Status**: *Pending inspection / audit* (Must verify source licence before copying any algorithms).

### Key Technical Areas to Investigate:
1. **Fingertip Distance Calculation**:
   - Euclidean distance formula between Landmark 4 (Thumb Tip) and Landmark 8 (Index Tip).
   - Handling of 2D ($x, y$) vs. 3D ($x, y, z$) coordinates from MediaPipe.
2. **Cycle & Peak Detection Logic**:
   - Method for detecting closing/opening inflection points.
   - Thresholding for noise suppression (preventing micro-tremors from registering as false taps).
3. **Kinematic Feature Extraction**:
   - Taps per second calculation (mean frequency vs. rolling window).
   - Inter-tap Interval (ITI) variability calculation.
   - Amplitude decrement: linear regression slope across successive opening peaks (to detect bradykinesia / hypometria).
4. **Known Limitations to Improve in NeuroMotion AI**:
   - Lack of scale invariance if user distance from camera changes (NeuroMotion AI implements anatomical reference scaling $S_{ref}$).

---

## Inspection Checklist for Engineering Agents

Before adapting any code from these repositories, the active AI agent (Codex or Antigravity) must:
- [ ] Inspect the `LICENSE` file in each repository.
- [ ] Document exact mathematical equations and algorithm steps.
- [ ] Confirm no GPL viral contamination if intending permissive MIT distribution.
- [ ] Re-implement clean, typed, and well-tested Python/JS functions in our own architecture.
- [ ] Log every adaptation into `docs/REUSE_AND_ATTRIBUTION.md`.

