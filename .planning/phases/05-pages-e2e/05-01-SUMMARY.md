---
phase: 05-pages-e2e
plan: "01"
subsystem: pages
tags: [pages, today, sidebar, layout, y2k, framer-motion, server-component]
dependency_graph:
  requires:
    - 04-02 (StatusBadge, ScoreBar, ListingCard, ProgressMeter raw + wrappers)
    - 04-01 (framer-motion v12, motion-presets.ts, pixelBootUp)
  provides:
    - Sidebar (raw + motion wrapper, 4 nav items, Y2K active state)
    - TodayHero (raw + motion wrapper, ProgressMeter + Follow-ups + Top 5)
    - /today landing page (server component, direct parser invocation)
    - 2-col layout shell (Sidebar 240px + flex-1 main)
  affects:
    - All routes (layout.tsx wraps every page with Sidebar)
    - Phase 5 E2E tests (05-03) — page structure now testable
tech_stack:
  added: []
  patterns:
    - server-component direct parser invocation (avoid SSR self-fetch loop)
    - x-pathname header for active nav detection in layout
    - pixelBootUp readonly-tuple spread fix for Framer Motion mutable array types
    - raw/ server-safe components importing client wrappers (React 19 boundary auto-applies)
key_files:
  created:
    - dashboard/web/components/raw/Sidebar.tsx
    - dashboard/web/components/Sidebar.tsx
    - dashboard/web/components/raw/TodayHero.tsx
    - dashboard/web/components/TodayHero.tsx
  modified:
    - dashboard/web/app/layout.tsx
    - dashboard/web/app/page.tsx
decisions:
  - "x-pathname header strategy: Next 15 App Router doesn't expose pathname to layouts; fallback to '/' if header absent (Plan 05-02 will add middleware if needed)"
  - "Direct parser invocation in page.tsx: parseApplications(applicationsPath()) instead of fetch('/api/applications') — SSR self-fetch causes hostname resolution failure in Next 15"
  - "pixelBootUp readonly spread: as const makes transition.times a readonly tuple; spread to mutable array when passing to Framer Motion animate/transition props"
  - "Nav items defined in layout.tsx deriveNav(), not hardcoded in raw/Sidebar.tsx — Sidebar is generic and renders whatever items array it receives"
metrics:
  duration_minutes: 10
  completed_date: "2026-05-20"
  tasks_completed: 3
  tasks_total: 3
  files_created: 4
  files_modified: 2
---

# Phase 05 Plan 01: Sidebar + /today Landing Page Summary

**One-liner:** Sidebar (240px, 4 nav items, Y2K acid active state) + TodayHero (pixelBootUp + ProgressMeter + overdue follow-ups + Top 5 by score) replace the Phase 1 smoke card; 2-col layout shell mounted globally; 50/50 tests still passing, build exits 0.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Sidebar raw + wrapper + layout mount | 7ab1984 | raw/Sidebar.tsx, Sidebar.tsx, app/layout.tsx |
| 2 | TodayHero raw + motion wrapper | fd9e258 | raw/TodayHero.tsx, TodayHero.tsx |
| 3 | Replace page.tsx with /today server component | 6b592af | app/page.tsx |

## Test Counts

| Point | Test Files | Tests |
|-------|------------|-------|
| Baseline (04-02 complete) | 15 | 50 |
| After this plan | 15 | 50 |

No new test files added in this plan (E2E tests come in 05-03). All 50 existing tests pass with no regression.

## Decisions Made

1. **x-pathname header strategy** — Next 15 App Router server layouts have no direct access to the request pathname. The conventional pattern is to read `x-pathname` or `x-invoke-path` from request headers, falling back to `"/"` for build-time static generation. Plan 05-02 will add `middleware.ts` to inject `x-pathname` if the fallback proves insufficient.

2. **Direct parser invocation** — `page.tsx` calls `parseApplications(applicationsPath())` and `parsePipeline(pipelinePath())` directly rather than `fetch('/api/applications')`. In Next 15 App Router, `fetch` from a server component to its own API routes during SSR/build requires a resolved hostname, which is unavailable at build time and unreliable in dev. Direct invocation reuses the same parsers the API routes use, with identical return shape `{ data, errors }`.

3. **pixelBootUp readonly spread** — `pixelBootUp` is defined `as const` in `motion-presets.ts`, making `animate.opacity` and `transition.times` readonly tuples. Framer Motion's TypeScript types require mutable arrays for keyframe values. Fixed by spreading: `[...pixelBootUp.animate.opacity]` and `[...pixelBootUp.transition.times]` at the call site in `TodayHero.tsx`.

4. **Nav items in layout, not Sidebar** — The raw `Sidebar` component is generic (renders whatever `SidebarNavItem[]` it receives). The nav items including "Reports" and "Settings" are defined in `deriveNav()` inside `layout.tsx`. This keeps the Sidebar reusable and the nav configuration centralized.

## Design Token Coverage

| Component | Tokens Used |
|-----------|------------|
| Sidebar (raw) | `bg-bg`, `bg-paper`, `bg-acid`, `bg-magenta`, `text-ink`, `text-ink-dim`, `border-ink`, `border-chrome`, `font-display`, `font-mono`, `shadow-[4px_4px_0_var(--color-ink)]`, `w-[240px]` |
| TodayHero (raw) | `bg-magenta-soft`, `border-magenta`, `border-l-[3px]`, `font-display`, `font-mono`, `font-body`, `text-ink`, `text-ink-muted`, `text-5xl`, `gap-2xl`, `gap-md` |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] pixelBootUp readonly tuple incompatible with Framer Motion mutable array types**

- **Found during:** Task 2 TypeScript check
- **Issue:** `motion-presets.ts` defines `pixelBootUp` with `as const`, making `animate.opacity` (`readonly [0, 0.5, 1]`) and `transition.times` (`readonly [0, 0.5, 1]`) readonly tuples. Framer Motion's `animate` prop type requires `UnresolvedValueKeyframe[]` (mutable), causing TS2322 errors in `TodayHero.tsx`.
- **Fix:** Spread the readonly arrays at the call site: `animate={{ opacity: [...pixelBootUp.animate.opacity] }}` and `transition={{ duration: pixelBootUp.transition.duration, times: [...pixelBootUp.transition.times] }}`. No change to `motion-presets.ts` (preserves `as const` for other consumers like `ScoreBar` which don't hit this issue).
- **Files modified:** `dashboard/web/components/TodayHero.tsx`
- **Commit:** fd9e258

## Known Stubs

None. All sections render real data:
- ProgressMeter receives live stats derived from `parseApplications()` output
- Follow-ups section derives from real Application[] filtered by status + date
- Top 5 section derives from real PipelineEntry[] filtered by state + score
- Parse-errors banner only appears when actual parse errors exist (zero by default on clean data)

## Threat Flags

No new network endpoints, auth paths, file access patterns, or schema changes introduced. The server component reads from the filesystem (existing parsers) and passes data to pure presentation components.

## Self-Check: PASSED

- [x] `dashboard/web/components/raw/Sidebar.tsx` exists — 4 nav items, Y2K acid active state, data-testid="sidebar"
- [x] `dashboard/web/components/Sidebar.tsx` exists — 'use client', fadeUp, data-testid="motion-sidebar"
- [x] `dashboard/web/components/raw/TodayHero.tsx` exists — isOverdueFollowUp, deriveTopFive, parse-errors-banner, border-magenta
- [x] `dashboard/web/components/TodayHero.tsx` exists — 'use client', pixelBootUp spread, data-testid="motion-today-hero"
- [x] `dashboard/web/app/layout.tsx` modified — async RootLayout, Sidebar imported and rendered, flex 2-col shell
- [x] `dashboard/web/app/page.tsx` replaced — TodayHero rendered, parseApplications+parsePipeline direct call, smoke card gone
- [x] Commits 7ab1984, fd9e258, 6b592af all exist in git log
- [x] 50/50 tests pass (npm run test:run)
- [x] npm run build exits 0 (Route / compiled successfully)
- [x] No hex literals in raw/ components
- [x] No framer-motion imports in raw/ components
