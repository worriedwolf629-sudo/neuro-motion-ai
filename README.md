# NeuroMotion AI

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black.svg?logo=vercel)](https://neuro-motion-parkinson-ai.vercel.app/)
[![GitHub Pages](https://img.shields.io/badge/Mirror-GitHub%20Pages-blue.svg)](https://worriedwolf629-sudo.github.io/neuro-motion-ai/)
[![Status](https://img.shields.io/badge/status-functional%20prototype-brightgreen.svg)](#project-status)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](#intellectual-property--ethics)
[![Framework: React 19](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vision: MediaPipe Tasks](https://img.shields.io/badge/MediaPipe-Tasks%20Vision-4285f4.svg)](https://developers.google.com/mediapipe)

**Understand movement beyond what the eye can see.**

NeuroMotion AI is an explainable, browser-based screening and triage prototype that uses commodity webcam hand tracking and local signal processing to quantify resting-hand tremor, finger-tapping kinematics, and exploratory voice-signal measurements.

---

> **Research screening aid: compares measurements to provisional reference ranges. Not a diagnosis. Consult a neurologist.**
>
> NeuroMotion AI is a rule-based screening and triage aid that returns an explainable triage tier alongside the descriptive metrics behind it. It contains no disease probability, no 0–100 composite risk score, and no black-box machine-learning models. Comparison thresholds are provisional and have not been validated on consumer webcams or microphones; low-quality recordings yield "Uncertain: re-test" and are excluded from triage.

---

## 1. Problem Statement & Motivation: Movement Disorder Screening & Triage

Observational motor assessments—such as items on the **Movement Disorder Society Unified Parkinson’s Disease Rating Scale (MDS-UPDRS Part III)**—remain the cornerstone of movement disorder evaluation. However, conventional examinations face inherent limitations:

1. **Observer Subjectivity**: Estimating resting tremor frequencies (3–7 Hz) or subtle amplitude decrements with the naked eye introduces inter-rater variability.
2. **Hardware & Accessibility Barriers**: Specialized motion-capture systems, sensorized gloves, and electromagnetic trackers cost thousands of dollars, require clinical calibration, and cannot be used at home.
3. **The "Black-Box" Diagnostic AI Trap**: Machine learning models that output opaque diagnostic probabilities alienate clinicians due to lack of explainability, clinical bias, and regulatory risk.

### The NeuroMotion AI Solution
NeuroMotion AI bridges this gap with a **zero-hardware-overhead, privacy-first, fully explainable kinematic engine**:
- **Commodity RGB Webcams**: Runs at 30+ FPS directly in modern web browsers using WebGL acceleration.
- **Client-Side Privacy**: Camera frames and microphone audio are processed in the browser and are not uploaded. Voice audio is discarded after feature extraction.
- **Deterministic Signal Processing**: Replaces black-box neural networks with transparent signal processing (Fast Fourier Transform, Butterworth filtering, anatomical scale normalization, and peak prominence detection).

---

## 2. Core Scientific Methodology

NeuroMotion AI offers two movement assessments and an exploratory voice-signal task:

```
Webcam Frame (Browser)
       │
       ▼
MediaPipe Tasks-Vision (21 3D Landmarks @ ~30 FPS)
       │
       ├────────────────────────────────────────┬────────────────────────────────────────┐
       ▼                                        ▼                                        ▼
[Module A: Resting Tremor]              [Module B: Finger Tapping]              [Signal Quality Guardrails]
- Index Tip (8) spatial deviation       - Thumb (4) to Index (8) distance       - Nyquist Criterion check (>24 FPS)
- Principal Axis projection             - Wrist-to-MCP anatomical scale $S_{ref}$ - Uniform 30 Hz grid interpolation
- 0.5–12.0 Hz Butterworth Bandpass      - Low-pass smoothing & hysteresis       - Hand frame boundary detection
- Discrete FFT spectral decomposition   - Peak/trough opening cycle detection   
- Dominant frequency & 4–6 Hz power ratio- Cadence, interval CV%, fatigue slope 
       │                                        │                                        │
       └────────────────────────────────────────┴────────────────────────────────────────┘
                                                │
                                                ▼
                         [Explainable Telemetry Dashboard & Motor Report]
```

The microphone task records a five-second sustained vowel, estimates pitch from short audio windows, calculates pitch and RMS-amplitude variation, and plots estimated pitch over time. Audio is processed locally in memory and discarded; it is not uploaded or stored. This is not a validated voice biomarker or a diagnostic feature.

### Module A: Resting Tremor Analysis
1. **Landmark Extraction**: Tracks Landmark 8 (Index Fingertip) while the subject's forearm rests comfortably.
2. **Principal Oscillation Axis Projection**: Conventional Euclidean displacement magnitude $\sqrt{(x-\bar{x})^2 + (y-\bar{y})^2}$ folds symmetric oscillations and falsely doubles fundamental frequency. NeuroMotion AI projects spatial displacement along the principal variance axis (PCA) to maintain true zero-crossing harmonics ($f_0$).
3. **Uniform Grid Resampling**: Webcam frame timestamps vary due to hardware scheduling. Timestamps are linearly interpolated onto a uniform 30 Hz time grid ($\Delta t = 33.3\text{ ms}$) prior to spectral analysis to prevent frequency warping and spectral leakage.
4. **Butterworth Bandpass Filtering**: A 4th-order zero-phase bandpass filter (0.5–12.0 Hz) removes slow baseline postural drift (<0.5 Hz) and high-frequency camera sensor noise (>12 Hz).
5. **Discrete Fast Fourier Transform (FFT)**: Computes single-sided spectral power distributions with Hanning windowing, isolating dominant tremor frequency (Hz) and concentration within the 4.0–6.0 Hz physiological tremor band.

### Module B: Finger-Tapping Kinematics
1. **Anatomical Scale Normalization ($S_{ref}$)**: Moving closer to or further from the webcam distorts raw pixel distances. We normalize thumb-index separation ($D_{raw}$) by the instantaneous anatomical distance between Landmark 0 (Wrist) and Landmark 9 (Middle Finger MCP joint):
   $$D_{norm}(t) = \frac{\sqrt{(x_4 - x_8)^2 + (y_4 - y_8)^2 + (z_4 - z_8)^2}}{\sqrt{(x_0 - x_9)^2 + (y_0 - y_9)^2 + (z_0 - z_9)^2}}$$
2. **Extrema Cycle Detection & Hysteresis**: Tapping peaks (maximal aperture) and closure troughs are detected using temporal refractory periods (~200 ms) and dynamic threshold hysteresis to avoid duplicate counting of hesitation micro-movements.
3. **Kinematic Metrics**:
   - **Tapping Cadence**: Completed opening-closing cycles per second (Hz).
   - **Rhythm Variability**: Inter-Tap Interval (ITI) Coefficient of Variation:
     $$\text{CV} = \frac{\sigma_{ITI}}{\mu_{ITI}} \times 100\%$$
   - **Amplitude Fatigue Slope**: Linear regression slope across opening peaks over the 10-second window to detect progressive movement decrement (hypometria).

---

## 3. Technological Architecture

The assessment pipeline runs in the browser and can be hosted statically. Optional Supabase Auth and Postgres provide account login and cross-device assessment history. The repository also contains a FastAPI analysis service; the current browser capture flow does not call those API endpoints.

| Layer | Technology | Responsibility |
|---|---|---|
| **Frontend Framework** | React 19 + Vite | Component lifecycle, state management, modular routing |
| **Styling & Design System** | Tailwind CSS v4 | Warm ivory aesthetic (`#FAF9F4`), custom design tokens |
| **Computer Vision** | `@mediapipe/tasks-vision` | WebAssembly & WebGL hand landmark detection |
| **Kinematics Engine** | Pure JavaScript/TypeScript (`kinematicsEngine.js`) | Client-side FFT, resampling, Butterworth filters, kinematics |
| **Visual Telemetry** | Recharts | Displacement waveforms, 4–6 Hz highlighted FFT spectra |
| **Voice Signal Analysis** | Browser MediaRecorder + Web Audio | Local estimated pitch and RMS-amplitude variation; audio discarded |
| **Accounts & History** | Supabase Auth + Postgres | Email sign-in, per-account dated derived measurements, comparison chart and table protected by Row Level Security |
| **CI/CD & Hosting** | GitHub Pages + GitHub Actions or Vercel | Static frontend build; Vercel uses root asset paths |

---

## 4. UI/UX Design System

Styled according to modern healthcare design principles with a **warm, minimal ivory and golden butter palette**:

- **Warm Ivory (`#FAF9F4`)**: Soft, welcoming foundational canvas.
- **Pure White (`#FFFFFF`)**: High-contrast, clean elevated card surfaces.
- **Butter & Golden Yellow (`#F4D66D` / `#E9BD4B`)**: Signature accent for primary buttons, active protocol markers, and chart telemetry highlights.
- **Warm Charcoal (`#292820`)**: High-contrast typography for medical clarity.
- **Typography**: Space Grotesk / Plus Jakarta Sans for headings; Inter for numerical data readouts.

---

## 5. Repository Structure

```
neuro-motion-ai/
├── .github/workflows/deploy.yml   # Automated GitHub Pages CI/CD pipeline
├── README.md                      # Comprehensive project documentation
├── AGENTS.md                      # Multi-agent collaboration protocol (Codex & Antigravity)
├── PROMPT.md                      # Chronological AI work ledger
├── docs/
│   ├── ARCHITECTURE.md            # System architecture and API schemas
│   ├── DECISIONS.md               # Architecture Decision Records (ADRs 001–006)
│   ├── DESIGN_SYSTEM.md           # Visual identity, tokens, and contrast specifications
│   ├── HANDOFF_LOG.md             # Context-switching ledger for pair programming agents
│   ├── PROJECT.md                 # Product specifications and non-goals
│   ├── RESEARCH_REFERENCES.md     # Reference research audit notes
│   ├── REUSE_AND_ATTRIBUTION.md   # Open-source attribution ledger
│   └── TASKS.md                   # Feature tracking board
├── frontend/
│   ├── src/
│   │   ├── components/            # Sidebar, HUD bars, navigation
│   │   ├── features/
│   │   │   ├── analysis/          # kinematicsEngine.js (FFT, filters, tapping)
│   │   │   ├── dashboard/         # TelemetryCharts.jsx (Recharts visualizers)
│   │   │   └── hand-tracking/     # HandTrackerCanvas.jsx (MediaPipe Tasks-Vision)
│   │   ├── pages/                 # Landing, Dashboard, Selection, Live, Results, Report, History
│   │   ├── App.jsx                # Root router and state controller
│   │   ├── index.css              # Tailwind v4 theme tokens
│   │   └── main.jsx               # React 19 mount point
│   ├── vite.config.js             # Vite configuration with base path
│   └── package.json
├── supabase/migrations/           # Account-scoped assessment record table and RLS policies
└── backend/                       # Python FastAPI analysis service (not called by current browser flow)
```

---

## 6. Local Development & Setup

### Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **Webcam**: Standard USB or built-in webcam
- **Microphone**: Required only for the optional voice task
- **Browser**: Google Chrome, Microsoft Edge, or Mozilla Firefox (WebGL enabled)

### Running the Application

```bash
# Clone the repository
git clone https://github.com/worriedwolf629-sudo/neuro-motion-ai.git
cd neuro-motion-ai/frontend

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open your browser at **`http://localhost:5173/`** (or the port specified in terminal output).

For the voice task, open **Assessment Selection → Voice Signal Assessment**, allow microphone access, and sustain a comfortable “ah” sound during the five-second capture. The browser analyzes audio locally and discards it; the exported CSV contains derived signal measurements only. Microphone access requires HTTPS or localhost.

### Account dashboard and assessment history

The site can run in browser-only demo mode without cloud configuration. To enable email login and a private, cross-device record history:

1. Create a Supabase project and run [`supabase/migrations/202611060001_assessment_records.sql`](supabase/migrations/202611060001_assessment_records.sql) in its SQL editor.
2. Copy `frontend/.env.example` to `frontend/.env.local` and set `VITE_SUPABASE_URL` plus the project's **publishable** key (the legacy `anon` key is also accepted). Never put the `service_role` key in frontend variables.
3. In Supabase Auth, enable email OTP and add the exact website callback URL to the allowed redirect URLs. For GitHub Pages use `https://<owner>.github.io/neuro-motion-ai/`; for Vercel use the deployed domain root.
4. For GitHub Pages, add repository variable `VITE_SUPABASE_URL` and repository secret `VITE_SUPABASE_PUBLISHABLE_KEY` under **Settings → Secrets and variables → Actions**; the deployment workflow passes them to Vite. For Vercel, add both values under **Project → Settings → Environment Variables**. On Vercel, set the frontend project root to `frontend` with build command `npm run build` and output directory `dist`, then redeploy.

After sign-in, new tremor, tapping, and voice measurements are saved as separate records with completion date/time, assessment type, recording quality, and derived metrics. The dashboard shows recent records; **Session History** compares all saved records for one measurement at a time. Raw camera video, microphone audio, and hand landmarks are not uploaded or stored. Existing browser history can be displayed locally where enough measurements exist, but its old format did not retain exact times or full per-assessment data, so missing detail is labeled rather than guessed.

Account comparison charts show measurement trends across sessions only.

## What it screens for

NeuroMotion records descriptive movement and voice measurements: rest tremor (hand displacement and dominant frequency), bradykinesia via finger tapping (cadence, interval variability, and fatigue decrement slope), and voice acoustic features (sustained-vowel pitch, local jitter, local shimmer, autocorrelation-based HNR, and voiced fraction). A provisional, explainable rules layer counts modality-level measurements outside custom bands and excludes modalities that fail recording-quality gates. Its labels are `WITHIN_TYPICAL_RANGE`, `BORDERLINE_RETEST`, `SUGGEST_NEUROLOGIST_FOLLOWUP`, or `INCOMPLETE_SCREEN`; they are exploratory triage prompts to guide professional clinical follow-up. Every band is marked provisional and `to verify` in one configuration object.

**Research screening aid: compares measurements to provisional reference ranges. Not a diagnosis. Consult a neurologist.**

## Validation

Run `cd frontend && npm test` for deterministic synthetic signal tests. Run `python -m venv .venv-validation`, install `scripts/requirements-validation.txt` in that environment, then run `python scripts/validate_uci_voice.py` to fetch UCI Parkinsons dataset 174 and regenerate [`docs/VALIDATION.md`](docs/VALIDATION.md). That report gives per-recording means ± SD, Mann–Whitney U p-values, and single-feature AUROCs for jitter, shimmer, and HNR. UCI contains repeated recordings from 31 people, so recording rows are not independent subjects. Its acoustic features do not validate our browser extraction or custom screening thresholds.

## Limitations

- Provisional thresholds: custom comparison bands are experimental and require prospective clinical calibration.
- Hardware variability: microphone frequency responses, webcam frame rates, lighting, room acoustics, and hand tracking dropouts introduce variability.
- No clinical cohort: the system has not been validated on a prospective clinical cohort with consumer hardware.
- Early or subtle disease signs: early PD can present without detectable resting tremor or vocal changes and may be missed by screening.
- Synthetic tests verify math behavior on generated signals only; the browser voice estimator is an autocorrelation approximation, not a Praat-equivalent laboratory pipeline.
- Raw video, raw audio, and hand landmarks remain on the device and are never uploaded. Derived results may be saved to the account history as described above.
