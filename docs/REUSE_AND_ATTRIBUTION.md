# REUSE_AND_ATTRIBUTION.md — Open-Source Reuse & Attribution Register

This document serves as our transparent legal and intellectual property ledger. In accordance with open science practices and hackathon integrity rules, all external algorithms, equations, code snippets, or mathematical formulas must be logged here.

---

## Tracking Table

| Component / Concept | Original Source | Source License | What We Adapt / Study | Our Original Modifications & Improvements | Attribution Notice Required? |
|---------------------|-----------------|----------------|-----------------------|-------------------------------------------|------------------------------|
| **Tremor Signal Filtering & FFT** | `yasnaask/parkscreen` | *Pending source code verification* | Bandpass filtering parameters (0.5–12 Hz) & FFT frequency binning concept | Added dynamic timestamp resampling for variable webcam FPS, custom Nyquist quality checks, and real-time Recharts visualization | Yes (cite repo URL & authors) |
| **Finger Tapping Distance Calculation** | `arelraptor/UBU-PD-FT-Assessment` | *Pending source code verification* | Euclidean distance formulation between Landmark 4 & Landmark 8 | Added anatomical scaling ($S_{ref}$ = Wrist-to-Middle MCP distance) for perspective invariance, plus client-side real-time rendering | Yes (cite repo URL & authors) |
| **Hand Landmark Tracking** | Google MediaPipe | Apache 2.0 | MediaPipe Hands model and 21-landmark topology | Wrapped in modern React 18 hook with quality check overlay | Yes (Apache 2.0 license notice retained) |
| **Signal Processing Routines** | SciPy / NumPy | BSD-3-Clause | `scipy.signal.find_peaks`, `scipy.fft.rfft` | Custom Pydantic validation and typed API endpoints | Yes (standard Python package credit) |

---

## Attribution Policy & Academic Integrity

1. **No False Invention Claims**:
   - We explicitly state in our documentation and presentations that the fundamental physics of FFT for tremor frequency and MediaPipe landmark extraction were established by prior research.
   - Our team's innovation lies in **the unified real-time architecture, anatomical scale normalization, dual-test telemetry dashboard, explainable metric reports, and zero-hardware accessibility**.
2. **License Compliance**:
   - If an external repository is licensed under a restrictive license (e.g. GPL-3.0), we will not copy its code directly. Instead, we implement clean-room algorithms based on published mathematical literature.
   - If permissive (MIT/BSD/Apache 2.0), original copyright notices will be preserved in code file headers where applicable.

