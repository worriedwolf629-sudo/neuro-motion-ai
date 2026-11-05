# ARCHITECTURE.md — System Architecture & Data Flow

> **Status**: Proposed / Prototyping Architecture  
> **Note**: This document outlines the planned technical design. As technical findings emerge from prototype runs and reference repository inspections, record any modifications in `docs/DECISIONS.md` before changing this architecture.

---

## 1. High-Level Architectural Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER (Vite + React)                   │
│                                                                        │
│   ┌────────────────────┐            ┌──────────────────────────────┐   │
│   │   Webcam Stream    │──(frames)─►│  MediaPipe Hand Tracking     │   │
│   │   (HTML5 Video)    │            │  (21 3D Landmarks @ ~30 FPS) │   │
│   └────────────────────┘            └──────────────┬───────────────┘   │
│                                                    │                   │
│                                         (raw coordinates & timestamps) │
│                                                    ▼                   │
│   ┌────────────────────┐            ┌──────────────────────────────┐   │
│   │ Telemetry & Charts │◄─(metrics)─│ Session Buffer & Normalizer  │   │
│   │  (Recharts Canvas) │            │ (Local coordinate scaling)   │   │
│   └────────────────────┘            └──────────────┬───────────────┘   │
└────────────────────────────────────────────────────┼───────────────────┘
                                                     │ HTTP POST
                                                     │ (/api/v1/analyze/...)
                                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     BACKEND SERVICE (Python / FastAPI)                 │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                      FastAPI Routing Layer                     │   │
│   └───────────────┬────────────────────────────────┬───────────────┘   │
│                   │                                │                   │
│                   ▼                                ▼                   │
│   ┌──────────────────────────────┐  ┌──────────────────────────────┐   │
│   │ Tremor Analysis Pipeline     │  │ Tapping Kinematics Pipeline  │   │
│   │ - Signal Detrending          │  │ - Thumb-Index Distance (Eucl)│   │
│   │ - SciPy Bandpass (0.5-12 Hz) │  │ - Normalization (Hand Scale) │   │
│   │ - FFT & Power Spectral Dens. │  │ - Peak/Valley Extrema Detect │   │
│   │ - Dominant Frequency & Power │  │ - Tap Rate, Mean Interval    │   │
│   └──────────────────────────────┘  │ - Amplitude Decay / Slope    │   │
│                                     └──────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Responsibilities

### 2.1 Frontend Layer (`frontend/`)
- **Technology**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons.
- **Responsibilities**:
  - Request and manage browser camera permissions (`navigator.mediaDevices.getUserMedia`).
  - Run MediaPipe Hands client-side to extract 21 $(x, y, z)$ landmarks in real-time without sending raw video streams across the network (privacy-preserving & zero backend GPU requirements).
  - Draw real-time hand skeleton overlay on an HTML5 canvas layer.
  - Buffer landmark streams with high-resolution timestamps (`performance.now()`).
- During an active assessment, refresh a descriptive movement profile at 2 Hz using the same in-browser kinematics functions used for the final report. Tremor frequency is shown only after at least 3 seconds and an effective sample rate of at least 24 FPS.
  - Keep the active assessment pipeline in the browser. The FastAPI analysis endpoints remain available for direct API use; the current React assessment flow does not call them.
  - Render interactive charts:
    - Tremor displacement waveform ($y(t)$).
    - Power spectral density graph (Frequency in Hz vs. Power).
    - Finger-tapping distance curve ($D(t)$ with peak markers).
    - Summary metrics cards (Dominant Tremor Hz, Tap Count, Taps/Sec, Amplitude Fatigue).
  - Display user positioning guidance (distance, framing, FPS stability).

### 2.2 Backend Analysis Service (`backend/`)
- **Technology**: Python 3.10+, FastAPI, Uvicorn, NumPy, SciPy, Pydantic.
- **Responsibilities**:
  - Expose validated REST endpoints for offline or windowed batch analysis.
  - Validate signal quality (framerate regularity, sequence length, missing landmark gaps).
  - Execute mathematical signal processing and kinematics extraction:
    - **Tremor Module**: Detrending, Butterworth bandpass filtering, Fast Fourier Transform (FFT), peak power detection.
    - **Tapping Module**: Euclidean distance calculation, reference scaling normalization, peak detection (SciPy `find_peaks`), rhythm variability, linear regression on amplitude peaks for decrement slope.
  - Return typed JSON schemas with clear physical units.

### 2.3 Voice Signal Task (`frontend/src/features/voice/`)
- Audio is captured only after a user gesture and processed in the browser using Web Audio decoding.
- Pitch is estimated from 40 ms frames using normalized autocorrelation over a 70–400 Hz search range; RMS is calculated per frame. Summary values are pitch mean/range/SD/CV, RMS amplitude CV, and number of voiced frames.
- The recording is held in memory for analysis only, then released. No audio upload, audio file download, browser storage, backend endpoint, diagnosis, or disease score is part of this task.
- Values are experimental signal summaries and are sensitive to device, room, microphone processing, and task performance.

---

## 3. Coordinate System & Normalization Strategy

A major source of error in camera-based kinematics is **perspective distortion** (moving closer to or farther from the lens changes pixel distances). NeuroMotion AI enforces standard normalization:

### 3.1 Raw Landmarks
MediaPipe outputs:
$$L_i = (x_i, y_i, z_i) \quad \text{where } i \in [0, 20]$$
- $x, y \in [0.0, 1.0]$: Normalized to image width and height.
- $z$: Relative depth estimated by MediaPipe (wrist origin).

### 3.2 Hand Reference Scale Metric ($S_{ref}$)
To make finger-tapping distance invariant to camera distance, we define the **anatomical reference scale** $S_{ref}(t)$ as the Euclidean distance between the wrist ($L_0$) and the middle finger MCP joint ($L_9$):
$$S_{ref}(t) = \sqrt{(x_9(t) - x_0(t))^2 + (y_9(t) - y_0(t))^2}$$

### 3.3 Normalized Tapping Distance ($D_{norm}$)
The raw Euclidean distance between Thumb Tip ($L_4$) and Index Tip ($L_8$) is:
$$D_{raw}(t) = \sqrt{(x_4(t) - x_8(t))^2 + (y_4(t) - y_8(t))^2}$$
The normalized distance is calculated as:
$$D_{norm}(t) = \frac{D_{raw}(t)}{S_{ref}(t)}$$
This allows meaningful comparison of amplitude across different camera distances.

---

## 4. Signal Processing Pipeline

### 4.1 Tremor Pipeline (Resting Hand)
1. **Target Landmark**: Typically index finger MCP ($L_5$) or middle finger tip ($L_{12}$) tracked over a 5–10 second resting period.
2. **Quality Check**: Verify average sampling rate $\ge 20\text{ FPS}$ and dropouts $< 5\%$.
3. **Resampling**: If timestamps show mild jitter, interpolate to a uniform sampling grid ($f_s = 30\text{ Hz}$).
4. **Detrending**: Remove baseline drift using polynomial detrending or high-pass filtering ($f_c = 0.5\text{ Hz}$).
5. **Bandpass Filtering**: 4th-order Butterworth filter between $0.5\text{ Hz}$ and $12\text{ Hz}$.
6. **FFT Spectral Estimation**:
   - Apply Hanning window to mitigate spectral leakage.
   - Compute Fast Fourier Transform ($|X(f)|$).
   - Identify dominant peak $f_{max}$ in the physiological movement band (typically $3.0\text{ Hz} - 7.0\text{ Hz}$ for resting tremor).

### 4.2 Two-Phase Tremor Capture and Report Data

The browser tremor flow records two independent 10-second windows: Phase 1 (Rest), followed by Phase 2 (Cognitive Load). Each window is analyzed with the same tremor pipeline and retains its own waveform, FFT spectrum, quality, and measurement values. The result shape keeps the Phase 1 metrics at the top level for compatibility with existing dashboard and history consumers, and adds `phase1`, `phase2`, and `cognitive_amplification` fields for the report. The amplification value is the ratio of Phase 2 RMS amplitude to Phase 1 RMS amplitude; it is a descriptive comparison, not a disease score.

The report plots each phase's raw, filtered, and envelope displacement; compares the two amplitude envelopes; and displays a separate FFT spectrum for each phase. Older saved sessions without Phase 2 show an explicit “not recorded” state instead of fabricated comparison values. All report cards retain the app's white surface styling. No disease category, classifier output, or risk score is generated.

### 4.3 Tapping Kinematics Pipeline
1. Compute $D_{norm}(t)$ time-series.
2. Low-pass filter ($f_c \approx 8\text{ Hz}$) to remove landmark jitter.
3. Apply peak detection (`scipy.signal.find_peaks`) with minimum peak distance and prominence thresholds to isolate opening peaks ($P_k$) and closure troughs ($T_k$).
4. Compute:
   - **Total Tap Count**: Number of confirmed peak-trough cycles.
   - **Tapping Frequency (Cadence)**: $\text{Taps} / \Delta t$ (Hz).
   - **Inter-tap Interval (ITI)**: $t(P_{k+1}) - t(P_k)$.
   - **Rhythm Variability**: Coefficient of variation ($\text{CV}_{ITI} = \frac{\sigma_{ITI}}{\mu_{ITI}} \times 100\%$).
   - **Amplitude Fatigue / Decrement**: Linear regression slope of peak amplitudes $P_k$ over time.

---

## 5. Potential API Contracts (Pydantic Draft)

```json
// POST /api/v1/analyze/tremor
// Request Payload
{
  "sampling_rate_hz": 30.0,
  "timestamps_ms": [0, 33, 67, 100, ...],
  "coordinates": [
    {"x": 0.451, "y": 0.621, "z": -0.01},
    ...
  ]
}

// Response Payload
{
  "status": "success",
  "quality": {
    "effective_fps": 29.8,
    "duration_seconds": 5.2,
    "confidence_score": 0.96
  },
  "tremor_metrics": {
    "dominant_frequency_hz": 4.6,
    "peak_power": 0.042,
    "frequency_spectrum": [
      {"frequency_hz": 1.0, "power": 0.001},
      {"frequency_hz": 4.6, "power": 0.042}
    ]
  }
}
```

---

## 6. Account History and Persistence

- **Authentication and database**: Supabase Auth (email one-time link) and Supabase Postgres store account-owned assessment records. The browser sends only derived measurements and quality metadata; camera frames, audio, and raw hand-landmark streams are not stored.
- **Record shape**: `assessment_records` contains an account `user_id`, assessment type (`tremor`, `tapping`, or `voice`), completion timestamp, recording quality, effective FPS, and the typed result object as JSONB. Every completed assessment becomes a separate dated record.
- **Isolation**: Postgres Row Level Security is enabled. Select and insert policies require `auth.uid() = user_id`; a browser-side publishable key is safe only with these policies in place. Never expose a Supabase service-role key in the frontend.
- **History view**: The account dashboard lists recent sessions. The comparison page filters by assessment and measurement, plots all available records in time order, and shows the previous/latest values and difference. Comparisons describe measured changes; they are not diagnostic scores.
- **Local demo**: If Supabase environment variables are absent, the user can explicitly enter browser-only mode. New records then remain in that browser's LocalStorage and do not sync or back up. Legacy local history can be shown with date-only or unknown-time labels because the previous format did not retain exact completion times or full per-test measurements.
- **Setup**: Apply `supabase/migrations/202611060001_assessment_records.sql`, then set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the frontend build. Add the deployed website URL to Supabase Auth's allowed redirect URLs. GitHub Pages builds use `/neuro-motion-ai/`; Vercel builds use `/`.

## 7. Undecided Architecture Elements

The following items are deliberately left open pending prototype experimentation:
1. **Full Client-Side vs. Hybrid Backend FFT**: If WebGL/JS FFT (e.g. `fft.js` or DSP.js) proves fast and sufficiently accurate in Vite, can tremor FFT be computed entirely in the browser for zero-latency demos? (To be evaluated in TASK-001/TASK-005).
2. **FastAPI deployment**: The FastAPI service is implemented but is not connected to the current React capture pipeline. Deploy and integrate it only if the product later needs server-side analysis or a shared analysis API.

