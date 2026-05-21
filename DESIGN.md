# Design System — career-ops Dashboard

> User-layer file (NEVER auto-updated by santifer update-system.mjs).
> Source of truth for ALL visual decisions in dashboard/web/ and any future UI surfaces.
> Always read this before generating components, styling code, or making aesthetic choices.

## Product Context

- **What this is**: Local web dashboard nad career-ops AI job-search pipeline. Aggreguje data/applications.md (81 rows), data/pipeline.md (111 pending), reports/ + output/ PDFs into single interactive view.
- **Who it's for**: Pojedynczy user (Michał Maciejewski, Design System Designer). Daily-driver podczas job search. Może być screen-share podczas interview lub portfolio demo.
- **Space/industry**: Personal productivity tooling / career operations
- **Project type**: Next.js 15 web app (localhost:3000, headed dev mode)
- **Memorable thing**: Maximalist tool with paper soul. "Career-ops as 2000s software CD" — Y2K personality moments + paper-based calm chrome. Job search anxiety neutralized by warm cream background; neon accents fire ONLY when action needed.

## Aesthetic Direction

- **Direction**: Y2K Maximalist Chaos (paper-grounded)
- **Decoration level**: Expressive — pixel grid texture in margins, CRT scanline (1% opacity) overlay, geometric primitives (triangles, circles, half-tones) floating in negative space
- **Mood**: Dense + layered + bold + retro-futuristic + paper warmth. Energetic without being anxious. Software-as-craft, not SaaS-as-product.
- **Reference vibes** (no direct copy): early-2000s software splash screens, Y2K CD interfaces, retro arcade UIs, pre-flat OS chrome
- **Anti-references**: Linear, Notion purple SaaS sameness, Inter-saturation, gradient-button defaults, centered-everything

## Typography

- **Display/Hero**: **Bricolage Grotesque** — variable width grotesque, `font-variation-settings: "wdth" 60` for condensed-bold (Y2K toy energy). Weights: 700 (h2/h3), 800 (display)
- **Body**: **General Sans** (Indian Type Foundry, free) — clean neutral counter that balances maximalist visuals. Weights: 400 (body), 500 (UI), 600 (emphasis)
- **UI/Labels**: General Sans 500 (same family as body, distinct weight)
- **Data/Tables**: General Sans with `font-feature-settings: 'tnum'` for tabular numerals (or fall back to mono for dense data)
- **Mono/Code/Timestamps**: **IBM Plex Mono** (free, retro tech) — also used for section labels (`// Progress`) and badges
- **Loading**: Google Fonts CDN for Bricolage Grotesque + IBM Plex Mono. Fontshare CDN for General Sans. Self-host in `public/fonts/` for production.

```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap">
```

### Type scale (8pt-based, ratio 1.333)

| Token | px | rem | Usage |
|-------|----|-----|-------|
| `text-xs` | 10 | 0.625 | Section labels, badges, micro-meta |
| `text-sm` | 12 | 0.75 | Caption, dense table cells |
| `text-base` | 14 | 0.875 | Body, list rows |
| `text-md` | 16 | 1 | Default reading |
| `text-lg` | 18 | 1.125 | Card titles |
| `text-xl` | 22 | 1.375 | Subsection heading |
| `text-2xl` | 28 | 1.75 | Section heading (Bricolage 700) |
| `text-3xl` | 36 | 2.25 | Card emphasis (Bricolage 700) |
| `text-4xl` | 48 | 3 | Progress numbers (Bricolage 800) |
| `text-5xl` | 72 | 4.5 | Page hero "Today." (Bricolage 800 wdth-60) |

## Color

- **Approach**: Expressive with discipline. Paper background everywhere; triple-neon accents ONLY for status/action/score (not chrome).
- **Light mode (default)**:

```css
--color-bg:       #faf6ee  /* warm cream paper */
--color-paper:    #fff9ec  /* card surface, slightly lighter than bg */
--color-ink:      #0a0a08  /* deep ink, near-black with brown undertone */
--color-ink-soft: #2a2a26
--color-ink-muted: #5a5a52
--color-ink-dim:  #8a8a82
--color-chrome:   #d4d4dc  /* secondary surfaces, borders soft */
```

- **Triple accent (status/action only — NEVER in chrome)**:

```css
--color-cyber:    #00d4ff  /* interactive / [Open] buttons / "today" tag / links */
--color-magenta:  #ff006e  /* needs-attention / follow-up overdue / errors / delete */
--color-acid:     #b8ff00  /* success / applied status / score reveal / progress */
```

- **Soft variants** (for backgrounds/fills at status):

```css
--color-cyber-soft:   #00d4ff20
--color-magenta-soft: #ff006e15
--color-acid-soft:    #b8ff0030
```

- **Dark mode** (planned, secondary):

```css
--color-bg:       #0d0a14  /* warm off-black, slight purple tinge for CRT vibe */
--color-paper:    #14101c
--color-ink:      #faf6ee  /* invert paper as text */
/* Triple accent stays identical — neon equally vibrant on dark */
/* Reduce saturation of soft variants 5-10% to compensate dark amplification */
```

### Color usage rules

1. **Chrome stays neutral**: sidebar bg, navbar, card surfaces = paper/ink/chrome. No cyber/magenta/acid in structural elements.
2. **Cyber blue** = interactive primary. [Open] buttons, links, "today" tag, primary CTA.
3. **Magenta** = your attention is needed NOW. Overdue follow-up, validation error, destructive action.
4. **Acid green** = positive completion. Applied status, score reveal fill, success toast, progress bar fill.
5. **Chrome silver gradient** = secondary surface accent (decorative geometric primitives only). Use rarely.

## Spacing

- **Base unit**: 4px
- **Density**: Comfortable for daily use, chaotic spacing rhythm between sections (±50% swings allowed for tension)
- **Scale**:

| Token | px | Usage |
|-------|----|-------|
| `space-2xs` | 2 | Hairline gaps, badge padding |
| `space-xs` | 4 | Tight UI gaps |
| `space-sm` | 8 | Default small gap, button padding |
| `space-md` | 16 | Card internal, default rhythm |
| `space-lg` | 24 | Section internal padding |
| `space-xl` | 32 | Major component padding (progress card) |
| `space-2xl` | 48 | Section-to-section gap |
| `space-3xl` | 64 | Page top padding, major separator |

### Layout density rule

Between primary sections, vary padding by ±50% to create chaotic-rhythm tension:
- Section A: 32px top padding
- Section B: 48px top padding
- Section C: 24px top padding

This is intentional. Don't normalize.

## Layout

- **Approach**: Hybrid — grid-disciplined for tabular data (`/pipeline` 12-col), creative-editorial for hero (`/today` 3-section stack with asymmetric card sizes)
- **Grid**: 12-col base. Container max-width 920px on `main`. Sidebar 240px fixed.
- **Border radius (chunky-flat)**:

| Token | px | Usage |
|-------|----|-------|
| `radius-none` | 0 | Cards, buttons, primary surfaces (intentional Y2K flat) |
| `radius-sm` | 4 | Nav items, tag pills (rare) |
| `radius-md` | 8 | (Used sparingly) |
| `radius-lg` | 14 | Progress card (the one "soft" surface) |

**Y2K signature**: Most surfaces have **2.5px solid black border + 6px offset box-shadow** instead of subtle border-radius blur. Buttons are flat hard rectangles. No drop-shadow blur.

```css
.card { border: 2.5px solid var(--color-ink); box-shadow: 6px 6px 0 var(--color-ink); }
.button { border-radius: 0; background: var(--color-ink); color: var(--color-bg); }
```

## Decoration

Maximalist personality moments (always at low opacity to not disrupt readability):

1. **Pixel grid texture** (1.5% opacity, repeating-linear-gradient horizontal lines every 4px) overlaid on `body::before`
2. **CRT scanline** (cyber blue 1.5% opacity, vertical gradient pulse every 4px) on `body::after`
3. **Geometric primitives** in sidebar/margins: rotating square (45deg), circle, triangle — solid neon fill with black border
4. **Section label prefix**: `//` prefix on every section heading (mono font, treats label as code comment)
5. **Brand "Y2K" tag**: rotated -2deg, hot magenta pill next to "career-ops" brand mark

## Motion

- **Approach**: Expressive — embraces Y2K maximalism, NOT minimalist functional
- **Easing**: `cubic-bezier(0.22, 1, 0.36, 1)` (out-expo, fast start)
- **Duration tokens**:

| Token | ms | Usage |
|-------|-----|-------|
| `motion-micro` | 80 | Hover color shifts |
| `motion-short` | 150 | Status badge wobble, button hover |
| `motion-medium` | 300 | Card hover translate+shadow appear |
| `motion-long` | 800 | Progress bar fill on mount, score count-up |

### Signature motion moments (Framer Motion v12 + layout animations)

1. **Hero entry**: Pixel boot-up sequence. `Today.` heading appears in 3 frames (50ms each) like CRT boot — opacity steps 0 → 0.5 → 1.
2. **Score reveal**: Number counts up 0 → 4.58 over 800ms, **chromatic aberration flash** at peak (text-shadow rgba split for 80ms then settle).
3. **Follow-up overdue badge**: Subtle wobble on mount (rotate -2deg → 2deg → 0 over 250ms ease-out).
4. **Card hover**: `translate(-3px, -3px)` + `box-shadow: 5px 5px 0 ink` appears — chunky lift effect.
5. **Status badge transitions**: Color cross-fade 150ms when status changes (evaluated → applied).
6. **List reorder**: Framer `layout` prop on parent, children animate via spring (`{ stiffness: 400, damping: 30 }`) when filter active.
7. **NO autoplay backgrounds**. Scanline/grid are static CSS, not animated.

## Status Color Mapping

Each canonical status (per `templates/states.yml`) gets ONE color, used consistently in pills, badges, table rows, and detail headers:

| Status | Color | Background | Usage |
|--------|-------|------------|-------|
| `Evaluated` | ink on chrome | `--color-chrome` | Default neutral, report done, decision pending |
| `Applied` | ink on cyber | `--color-cyber` | Application sent, awaiting response |
| `Responded` | ink on acid | `--color-acid` | Company replied — positive milestone |
| `Interview` | acid on ink | `--color-ink` (inverse) | Active interview process — most weight |
| `Offer` | inverse layered (acid + ink + magenta border) | Composite | Rare event, deserves visual emphasis |
| `Rejected` | dim ink, strike-through | transparent | Closed loop, archived |
| `Discarded` | ink-dim | transparent | User-rejected, archived |
| `SKIP` | ink-dim italic | transparent | Auto-filter skipped, hidden by default |

**Follow-up overdue** (separate signal, NOT a status): magenta border 3px + magenta-soft fill + `⚠ OVERDUE` micro-badge.

## Accessibility & RTL Notes

- **Contrast**: cream paper (#faf6ee) + ink (#0a0a08) = 16.8:1 (WCAG AAA all sizes)
- **Triple accents on paper**:
  - Cyber #00d4ff on cream = 2.1:1 — use only for backgrounds + ink text combo, NEVER cyber text on cream
  - Magenta #ff006e on cream = 4.8:1 (passes AA Large)
  - Acid #b8ff00 on cream = 2.0:1 — backgrounds + ink text only
- **Ink on cyber** = 10.2:1 ✓, **ink on acid** = 14.1:1 ✓, **ink on magenta** = 3.5:1 (use bold weight ≥600)
- **RTL**: All margin/padding via logical properties (`margin-inline-start`, `padding-block`). Bricolage Grotesque + General Sans + IBM Plex Mono all have RTL coverage (Arabic supported)
- **a11y**: Section labels (`// Progress`) read by screen reader as "Progress section"; consider `aria-label` overrides if mono prefix confuses.

## Implementation Notes (for magic MCP + Framer)

1. Generated components live in `dashboard/web/components/raw/`, motion-wrapped versions in `dashboard/web/components/` (per ENG REVIEW D6).
2. Each `raw/` component reads CSS variables from this DESIGN.md tokens.
3. Tailwind v4 config exposes these tokens (see `dashboard/web/tailwind.config.ts` once created).
4. Framer Motion variants defined in `dashboard/web/lib/motion-presets.ts` (per design doc Phase 5):
   - `fadeUp`, `scoreCountUp`, `pageTransition` (now `pixelBootUp`), `layoutSpring`, `chromaticFlash`.

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-20 | Initial Y2K maximalist DESIGN.md | Created via /design-consultation. User pivoted from quiet-command-center after preview. Choice driven by "portfolio piece + interview talking point + career-ops as 2000s software CD" mental model. Light cream bg keeps anxiety low; neon ONLY in action surfaces. |
| 2026-05-20 | Bricolage Grotesque display | Variable-width grotesque, condensed-bold setting gives Y2K toy energy without Inter convergence. Free Google Font. |
| 2026-05-20 | Triple neon accent (cyber + magenta + acid) | Each has distinct semantic role (action / attention / success). Departure from purple-default dashboards. |
| 2026-05-20 | Border + offset box-shadow instead of soft drop-shadow | Y2K-era flat chrome aesthetic, 2.5px solid + 6px offset signature. |
