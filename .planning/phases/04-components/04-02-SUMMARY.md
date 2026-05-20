---
phase: 04-components
plan: "02"
subsystem: components
tags: [components, raw, motion-wrapper, framer-motion, react-testing-library, vitest, y2k, design-tokens]
dependency_graph:
  requires:
    - 04-01 (framer-motion v12 runtime, motion-presets.ts, vitest jsdom + jest-dom setup)
  provides:
    - StatusBadge (raw + motion wrapper)
    - ScoreBar (raw + motion wrapper)
    - ListingCard (raw + motion wrapper)
    - ProgressMeter (raw + motion wrapper)
    - components/raw (pure presentation layer, motion-free)
    - motion wrappers (components/ layer, framer-motion decorated)
  affects:
    - Phase 5 /today and /pipeline pages (consume wrappers, not raw)
tech_stack:
  added: []
  patterns:
    - raw + motion-wrapper split (raw/ pure presentation, components/ framer-decorated re-exports)
    - Tailwind v4 @theme tokens only (no hex literals in JSX)
    - Y2K signature surfaces (2.5px border + 6px offset shadow, status color mapping)
    - vitest esbuild jsx automatic transform (jsxImportSource react)
key_files:
  created:
    - dashboard/web/components/raw/StatusBadge.tsx
    - dashboard/web/components/raw/ScoreBar.tsx
    - dashboard/web/components/raw/ListingCard.tsx
    - dashboard/web/components/raw/ProgressMeter.tsx
    - dashboard/web/components/StatusBadge.tsx
    - dashboard/web/components/ScoreBar.tsx
    - dashboard/web/components/ListingCard.tsx
    - dashboard/web/components/ProgressMeter.tsx
    - dashboard/web/components/__tests__/StatusBadge.test.tsx
    - dashboard/web/components/__tests__/ScoreBar.test.tsx
    - dashboard/web/components/__tests__/ListingCard.test.tsx
    - dashboard/web/components/__tests__/ProgressMeter.test.tsx
  modified:
    - dashboard/web/vitest.config.ts
decisions:
  - "raw/ layer is entirely motion-free (no framer-motion imports) — ensures Magic MCP regenerations don't clobber animations"
  - "Tests import motion-wrapped versions (not raw) — both layers exercised in single render, satisfying TST-05"
  - "vitest.config esbuild jsx:automatic added — required since tsconfig uses jsx:preserve for Next.js but vitest needs its own transform"
  - "16 new tests added (4 per component × 4 components), not 4 — each component file has 4 it() assertions covering presentation, behaviour, and motion wrapper presence"
metrics:
  duration_minutes: 15
  completed_date: "2026-05-20"
  tasks_completed: 3
  tasks_total: 3
  files_created: 12
  files_modified: 1
---

# Phase 04 Plan 02: Base Components (StatusBadge, ScoreBar, ListingCard, ProgressMeter) Summary

**One-liner:** 4 Y2K-styled raw components + 4 Framer Motion wrappers built, 16 RTL tests passing (50 total), vitest JSX transform fixed.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Build 4 raw/ presentational components | 8ebf922 | raw/StatusBadge.tsx, raw/ScoreBar.tsx, raw/ListingCard.tsx, raw/ProgressMeter.tsx |
| 2 | Build 4 motion-wrapped components | 7abd1e3 | StatusBadge.tsx, ScoreBar.tsx, ListingCard.tsx, ProgressMeter.tsx |
| 3 | Write 4 RTL tests + fix vitest JSX + run suite | f633c8c | components/__tests__/*.test.tsx, vitest.config.ts |

## Test Counts

| Point | Test Files | Tests |
|-------|------------|-------|
| Baseline (04-01 complete) | 11 | 34 |
| After this plan | 15 | 50 |

Each component test file has 4 it() blocks: presentation assertion, behaviour assertion, edge case or style check, motion wrapper presence check.

## DESIGN.md Token Coverage

| Component | Tokens Used |
|-----------|------------|
| StatusBadge | `bg-chrome`, `bg-cyber`, `bg-acid`, `bg-ink`, `bg-transparent`, `text-ink`, `text-acid`, `text-ink-dim`, `border-ink`, `border-magenta`, `font-mono`, `rounded-none` |
| ScoreBar | `bg-paper`, `bg-acid`, `border-ink`, `h-[14px]`, `rounded-none` |
| ListingCard | `bg-paper`, `bg-acid`, `bg-ink`, `text-ink`, `text-ink-soft`, `text-ink-muted`, `text-bg`, `border-ink`, `border-ink-muted`, `border-[2.5px]`, `shadow-[6px_6px_0_var(--color-ink)]`, `font-display`, `font-body`, `font-mono`, `rounded-none` |
| ProgressMeter | `bg-paper`, `bg-cyber`, `bg-magenta`, `bg-acid`, `bg-ink`, `text-ink`, `text-magenta`, `text-ink-muted`, `border-ink`, `font-display`, `font-mono`, `rounded-none` |

No hex literals appear in any raw/ file. The only CSS var reference is `shadow-[6px_6px_0_var(--color-ink)]` which uses the Tailwind @theme variable (not a hard-coded hex).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] vitest JSX transform missing — React is not defined**

- **Found during:** Task 3 (first test run)
- **Issue:** `tsconfig.json` sets `"jsx": "preserve"` for Next.js compatibility, but vitest/vite had no JSX transform configured. All component tests failed with `ReferenceError: React is not defined`.
- **Fix:** Added `esbuild: { jsx: "automatic", jsxImportSource: "react" }` to `vitest.config.ts`. This tells esbuild to use the React 17+ automatic JSX runtime (`react/jsx-runtime`) without requiring manual `import React` in every test file.
- **Files modified:** `dashboard/web/vitest.config.ts`
- **Commit:** f633c8c

### Count Discrepancy

The plan stated "4 new tests" resulting in 38 total. In practice each component test file contains 4 it() blocks (4 files × 4 tests = 16 new tests), yielding 50 total. This is a plan authoring inconsistency — the test specifications in the plan's `<action>` block show 4 it() per file. The user's objective correctly noted 38 = 34 + 4, but 4 was meant as "4 test files" not "4 test cases". All 16 test assertions cover meaningful behaviour and the test suite is richer for it.

## Known Stubs

None. All components render real data passed via props. No placeholder text, no hardcoded empty arrays, no mock data sources.

## Threat Flags

No new network endpoints, auth paths, file access patterns, or schema changes introduced. Components are pure presentation with no data fetching.

## Self-Check: PASSED

- [x] `dashboard/web/components/raw/StatusBadge.tsx` exists, 8 status keys in STATUS_CLASSES
- [x] `dashboard/web/components/raw/ScoreBar.tsx` exists, proportional fill + clamping
- [x] `dashboard/web/components/raw/ListingCard.tsx` exists, Y2K border + shadow + composes StatusBadge/ScoreBar
- [x] `dashboard/web/components/raw/ProgressMeter.tsx` exists, 4-column grid + multi-segment bar
- [x] `dashboard/web/components/StatusBadge.tsx` exists, 'use client', framer-motion, fadeUp
- [x] `dashboard/web/components/ScoreBar.tsx` exists, 'use client', framer-motion, fadeUp
- [x] `dashboard/web/components/ListingCard.tsx` exists, 'use client', framer-motion, layoutSpring, whileHover
- [x] `dashboard/web/components/ProgressMeter.tsx` exists, 'use client', framer-motion, fadeUp
- [x] All 4 test files exist in `components/__tests__/`
- [x] Commits 8ebf922, 7abd1e3, f633c8c all exist in git log
- [x] 50 tests pass, 0 failed
- [x] No hex literals in raw/ components
- [x] No framer-motion imports in raw/ components
