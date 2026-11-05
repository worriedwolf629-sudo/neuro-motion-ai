# DESIGN_SYSTEM.md — UI/UX Design System & Telemetry Tokens

> **Design Direction**: Modern, high-contrast healthcare analytics dashboard.
> Designed for rapid legibility during live 24-hour hackathon demonstrations, clinical usability, and accessible contrast ratios.

---

## 1. Visual Theme & Color Palette

The interface adopts a default **clinical dark theme** to maximize the visual punch of real-time camera skeleton overlays and animated telemetry waveforms.

### Palette Tokens

| Token Name | Hex Code | Role / Usage | Contrast Ratio vs Background |
|------------|----------|--------------|------------------------------|
| `--bg-base` | `#0A0F1D` | Main dashboard deep background | Base |
| `--bg-surface` | `#111827` | Card / panel background | 1.2:1 |
| `--bg-surface-elevated` | `#1F2937` | Modals, active states, dropdowns | 2.1:1 |
| `--border-subtle` | `#374151` | Panel borders and chart gridlines | 3.5:1 |
| `--text-primary` | `#F9FAFB` | Primary headers, dominant metric values | 16.5:1 (AAA) |
| `--text-secondary` | `#9CA3AF` | Labels, axis titles, secondary descriptions | 7.8:1 (AAA) |
| `--accent-emerald` | `#10B981` | Positive status, normal rhythm, healthy sync | 8.2:1 |
| `--accent-cyan` | `#06B6D4` | Primary brand accent, live camera landmark points | 8.9:1 |
| `--accent-amber` | `#F59E0B` | Warnings, low camera FPS, tracking jitter | 10.1:1 |
| `--accent-rose` | `#F43F5E` | Critical warnings, landmark lost, amplitude decay | 7.4:1 |

---

## 2. Typography

We pair a crisp, geometric display font with a highly legible technical sans-serif:

- **Display & Headings**: `Space Grotesk`, sans-serif (weights: 600, 700)
  - Used for project title, dominant metric readouts, and section banners.
- **Body & Data Telemetry**: `Archivo` / `Inter`, system-ui, sans-serif (weights: 400, 500, 600)
  - Used for numbers, coordinates, chart labels, and medical disclaimers.
- **Monospace Numbers**: `JetBrains Mono` / `ui-monospace`
  - Used for raw coordinates, millisecond timestamps, and frequency readouts ($4.8\text{ Hz}$).

### Typography Scale
- `Metric Jumbo`: `3.0rem` (`48px`), weight `700`, leading `1.0` (e.g. `4.8 Hz`, `18 Taps`)
- `Heading 1`: `1.75rem` (`28px`), weight `700`, leading `1.2`
- `Heading 2`: `1.25rem` (`20px`), weight `600`, leading `1.3`
- `Card Title`: `0.875rem` (`14px`), weight `600`, tracking `wider`, uppercase
- `Body Text`: `0.9375rem` (`15px`), weight `400`, leading `1.5`
- `Caption / Disclaimer`: `0.75rem` (`12px`), weight `400`, leading `1.4`

---

## 3. Visual Layout Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│ [HEADER] NeuroMotion AI | [Live FPS: 30] [Status: Tracking Active]     │
├───────────────────────────────────┬────────────────────────────────────┤
│ [CAMERA & OVERLAY PANE]           │ [TELEMETRY DASHBOARD PANE]         │
│ - Live WebCam Feed                │                                    │
│ - MediaPipe 21-point Skeleton     │ ┌────────────────────────────────┐ │
│ - Bounding Box & Center Target    │ │ Card 1: Dominant Tremor Hz     │ │
│ - Quality Badge: OK (30 FPS)      │ │ Value: 4.8 Hz | Band: 3-7 Hz   │ │
│                                   │ └────────────────────────────────┘ │
│ ┌───────────────────────────────┐ │ ┌────────────────────────────────┐ │
│ │ Control Bar                   │ │ │ Card 2: Finger-Tapping Stats   │ │
│ │ [● Start Test] [■ Reset]      │ │ │ 22 Taps | 2.8 /sec | Dec: -12% │ │
│ └───────────────────────────────┘ │ └────────────────────────────────┘ │
├───────────────────────────────────┴────────────────────────────────────┤
│ [ANALYTICS & WAVEFORMS (Recharts)]                                     │
│ ┌───────────────────────────────┐ ┌──────────────────────────────────┐ │
│ │ Graph A: Tremor FFT Spectrum  │ │ Graph B: Tapping Amplitude Wave  │ │
│ │ (Frequency vs Power)          │ │ (Normalized Distance vs Time)    │ │
│ └───────────────────────────────┘ └──────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. UI Components & Interaction States

1. **Live Camera Card**:
   - Aspect ratio: 16:9 or 4:3 fixed to avoid reflow.
   - Canvas overlay positioned directly over `<video>` using absolute styling.
   - Pulsing status indicator: Green (`#10B981`) when hand detected; Amber (`#F59E0B`) when hand partially outside frame; Red (`#F43F5E`) when tracking lost.
2. **Kinematic Metric Cards**:
   - Card container with `bg-[#111827] border border-[#374151] rounded-xl p-4`.
   - Subtle hover highlight (`hover:border-cyan-500/50 transition-colors`).
3. **Buttons & Controls**:
   - `Primary Button`: Emerald background, bold white text, subtle glowing shadow (`shadow-emerald-500/20`).
   - `Secondary Button`: Ghost outline with slate border.
   - High accessibility with `:focus-visible` ring styling.
4. **Assessment Report Modal**:
   - Clean printable layout with high-contrast light mode override for physical paper/PDF printing (`@media print`).

