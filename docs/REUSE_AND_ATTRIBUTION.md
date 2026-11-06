# REUSE_AND_ATTRIBUTION.md — Open-Source Reuse & Attribution Register

This document serves as our transparent legal and intellectual property ledger. In accordance with open science practices and hackathon integrity rules, all external algorithms, equations, code snippets, or mathematical formulas must be logged here.

---

## Tracking Table

| Component / Concept | Original Source | Source License | What We Adapt / Study | Our Original Modifications & Improvements | Attribution Notice Required? |
|---------------------|-----------------|----------------|-----------------------|-------------------------------------------|------------------------------|
| **Tremor Signal Filtering & FFT** | `yasnaask/parkscreen` | MIT License (Verified) | Displacement from coordinates, 4–6 Hz power ratio concept, Butterworth bandpass filter parameters | Replaced Euclidean norm center-displacement with signed principal axis projection to preserve fundamental frequency $f_0$; added uniform grid interpolation for webcam timestamp jitter | Yes (Preserved in code & docs) |
| **Finger Tapping Distance Calculation** | `arelraptor/UBU-PD-FT-Assessment` | Apache 2.0 (Verified) | Landmark 4 (Thumb) & Landmark 8 (Index) distance calculation; cycle cadence concepts | Added anatomical reference scaling $S_{ref} = \text{Wrist-to-Middle MCP}$ for webcam distance invariance; peak/trough validation; rhythm variability CV | Yes (Preserved in code & docs) |
| **Hand Landmark Tracking** | Google MediaPipe | Apache 2.0 | MediaPipe Hands model and 21-landmark topology | Real-time browser canvas HUD overlay with FPS monitor and landmark loss safeguards | Yes (Standard Apache 2.0 attribution) |
| **Scientific Computing** | SciPy / NumPy | BSD-3-Clause | `scipy.signal.find_peaks`, `scipy.signal.butter`, `scipy.fft.rfft` | Custom Pydantic REST schemas and FastAPI telemetry pipeline | Yes (Standard Python package attribution) |
| **Finger-tapping research reference** | [ROC-HCI/finger-tapping-severity](https://github.com/ROC-HCI/finger-tapping-severity) | MIT (repository identifies MIT license) | Reviewed its study context and feature-extraction focus; no classifier, model, dataset, or source file is copied | NeuroMotion retains its independent normalized thumb–index distance and deterministic cycle metrics; the paper/repository does not provide a calibrated threshold for this app | Yes (research reference) |
| **Voice feature definitions** | [hebamuh68/pd-voice-features](https://github.com/hebamuh68/pd-voice-features) | MIT (repository identifies MIT license) | Reviewed local jitter, local shimmer, HNR names, and documented Praat calls | Implemented independent browser calculations from the supplied formulas; not a port of Praat/Parselmouth and not equivalent to Praat measurements | Yes (methodology reference) |
| **Synthetic stream testing inspiration** | [lijiaxiang63/motorlens](https://github.com/lijiaxiang63/motorlens) | No license file found in the public repository listing checked 2026-11-06; no code reuse | Reviewed README discussion of synthetic streams and known expected values | Wrote new generators/tests independently for NeuroMotion's own engine; no MotorLens code copied | Yes (reference noted; no code reused) |
| **Voice comparison dataset** | [UCI Parkinsons dataset 174](https://archive.ics.uci.edu/dataset/174/parkinsons) | See dataset page terms | Script fetches numeric features for group summary statistics, Mann–Whitney U p-values, and single-feature AUROCs | Recording-level descriptive statistics; repeated recordings and a different acoustic pipeline mean they do not validate NeuroMotion's browser voice estimates | Yes (dataset cited in generated validation report) |

---

## Attribution Policy & Academic Integrity

1. **No False Invention Claims**:
   - We explicitly state in our documentation and presentations that the fundamental physics of FFT for tremor frequency and MediaPipe landmark extraction were established by prior research.
   - Our team's innovation lies in **the unified real-time architecture, anatomical scale normalization, dual-test telemetry dashboard, explainable metric reports, and zero-hardware accessibility**.
2. **License Compliance**:
   - If an external repository is licensed under a restrictive license (e.g. GPL-3.0), we will not copy its code directly. Instead, we implement clean-room algorithms based on published mathematical literature.
   - If permissive (MIT/BSD/Apache 2.0), original copyright notices will be preserved in code file headers where applicable.
   - Public visibility alone does not grant reuse rights. MotorLens code is not copied because no license file was present in the checked public repository listing.

