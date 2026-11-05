# DESIGN_SYSTEM.md — UI/UX Design System & "Flowing Intelligence" Tokens

> **Visual Identity**: "FLOWING INTELLIGENCE"  
> Combines warm, elegant ivory and cream backgrounds, flowing multi-colour gradient ribbons (teal, cyan, pale blue, lavender, violet, and gentle gold), crisp white cards, clean typography, and golden-yellow brand actions. Designed for rapid legibility during live healthcare demonstrations, clinical usability, and accessible contrast ratios.

---

## 1. Visual Theme & Color Palette

The interface adopts the **"Flowing Intelligence"** light-surface healthcare aesthetic. The signature visual element is layered, organic, translucent gradient ribbons that evoke flowing silk, liquid glass, or neural light trails.

### 1.1 Foundation Backgrounds

| Token Name | Hex Code | Role / Usage |
|------------|----------|--------------|
| `Warm Ivory` | `#FAF9F4` | Primary viewport, sidebar, and application root canvas |
| `Soft Cream` | `#F5F1E9` | Table headers, secondary banners, subtle accent sections |
| `Pure White` | `#FFFFFF` | Primary SaaS cards, elevated chart surfaces, modal panels |

### 1.2 Core Brand Accents

| Token Name | Hex Code | Role / Usage |
|------------|----------|--------------|
| `Butter Yellow` | `#F4D66D` | Primary action buttons, brand logo mark |
| `Golden Yellow` | `#E9BD4B` | Primary chart data series, hover states, badges |
| `Warm Charcoal` | `#292820` | Headings, high-contrast values, primary text (14.2:1 AAA) |
| `Muted Slate` | `#817D70` | Secondary descriptions, axis labels, caption copy |
| `Warm Border` | `#EAE6D9` | Card perimeter borders, separators, subtle grid lines |

### 1.3 Signature Flowing Ribbon Palette

Layered, translucent SVG bezier-curve ribbons that flow behind headers, banners, and the landing page hero:

| Token Name | Hex Code | Role in Gradient Ribbon |
|------------|----------|-------------------------|
| `Soft Teal` | `#75D5C7` | Left anchor, fresh clinical organic tone, secondary chart series |
| `Light Cyan` | `#A0DDEB` | Luminous flow, highlights, signal curves |
| `Pale Blue` | `#B9D5ED` | Ethereal midpoint transition |
| `Muted Lavender` | `#B8A8E8` | Deep harmonic transition, tertiary chart series |
| `Soft Violet` | `#D0B5EA` | Sophisticated neural tone, envelope indicators |
| `Subtle Gold` | `#F4D66D` | Brand-retaining warmth at terminal ribbon tips |

---

## 2. Signature Flowing Ribbon Architecture

Implemented via `<FlowingRibbon />` ([`frontend/src/components/FlowingRibbon.jsx`](../frontend/src/components/FlowingRibbon.jsx)):
- **Technology**: Pure responsive vector SVG with multi-stop linear gradients, soft gaussian blur filters, and gentle ambient keyframe float animation.
- **Performance**: Zero heavy WebGL/Three.js overhead. Sub-1ms render cost.
- **Accessibility**: 100% `pointer-events-none` with `aria-hidden="true"`. Respects `@media (prefers-reduced-motion: reduce)`.
- **Placement**:
  - **Landing Page**: Full multi-layer hero ribbon tapestry sweeping behind the headline and call-to-actions.
  - **Dashboard**: Subtle banner flourish behind the workspace banner and overview grid.
  - **Assessment Selection**: Flowing diagonal ribbon accent framing the protocol cards.
  - **Live Assessment / Results / Reports**: Restrained ambient accent along container perimeters, strictly separated from webcam viewports and data charts.

---

## 3. Typography

- **Display & Headings**: `Plus Jakarta Sans` / `Space Grotesk` (weights: 700, 800)
- **Body & Data Telemetry**: `Inter`, system-ui, sans-serif (weights: 400, 500, 600)
- **Monospace Numbers**: `JetBrains Mono` / `ui-monospace` (weights: 600, 700)

### Typography Scale
- `Hero Heading`: `3.5rem` (`56px`), weight `800`, leading `1.1`
- `Metric Jumbo`: `2.0rem` (`32px`) - `2.5rem` (`40px`), weight `800`, font-mono
- `Heading 1`: `1.5rem` (`24px`), weight `700`
- `Heading 2`: `1.125rem` (`18px`), weight `700`
- `Body Text`: `0.875rem` (`14px`) - `0.9375rem` (`15px`), weight `400`
- `Caption / Disclaimer`: `0.6875rem` (`11px`) - `0.75rem` (`12px`), weight `400`

---

## 4. Cards & Component System

- **Class**: `.card-flowing`
  - Background: `#FFFFFF`
  - Border: `1px solid rgba(234, 230, 217, 0.9)`
  - Shadow: `0 4px 20px -4px rgba(41, 40, 32, 0.04)`
  - Hover: `border-color: rgba(184, 168, 232, 0.45); box-shadow: 0 8px 30px -4px rgba(41, 40, 32, 0.08)`
- **Primary Buttons**:
  - Background: Butter Yellow `#F4D66D`, border `#E9BD4B`
  - Text: Warm Charcoal `#292820`, font-bold
  - Hover: `#E9BD4B` with subtle scale transition (`active:scale-95`)
- **Secondary Buttons**:
  - Background: White `#FFFFFF`, border `#EAE6D9`
  - Text: Warm Charcoal `#292820`, font-semibold
  - Hover: `#F5F1E9`

---

## 5. Charts & Analytics Styling

- **Chart Surface**: Pure White `#FFFFFF` inside `.card-flowing`
- **Grid Lines**: Warm Beige `#EAE6D9` (dashed `3 3`)
- **Axes & Ticks**: Charcoal Muted `#817D70`
- **Primary Data Series**: Golden Yellow `#E9BD4B`
- **Secondary Data Series**: Soft Teal `#75D5C7`
- **Envelope / Variability**: Muted Lavender `#B8A8E8`
- **4–6 Hz Physiological Band**: Soft Gold `#F4D66D` with 25% opacity
