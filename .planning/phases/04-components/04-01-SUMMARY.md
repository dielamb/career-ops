---
phase: 04-components
plan: "01"
subsystem: components
tags: [framer-motion, motion-presets, vitest-setup, testing-library, dependencies]
dependency_graph:
  requires: []
  provides:
    - framer-motion v12 runtime dep
    - motion-presets module (5 variants)
    - vitest jsdom + jest-dom setup
    - @testing-library/react dev dep
  affects:
    - dashboard/web/lib/motion-presets.ts (consumed by Plan 04-02)
    - dashboard/web/vitest.config.ts
tech_stack:
  added:
    - framer-motion ^12.39.0
    - "@testing-library/react ^16.3.2"
    - "@testing-library/jest-dom ^6.9.1"
  patterns:
    - Framer Motion variant shape (initial/animate/exit/transition as const)
    - vitest setupFiles for jest-dom extend
key_files:
  created:
    - dashboard/web/lib/motion-presets.ts
    - dashboard/web/vitest.setup.ts
  modified:
    - dashboard/web/package.json
    - dashboard/web/package-lock.json
    - dashboard/web/vitest.config.ts
decisions:
  - "framer-motion pinned to ^12.39.0 (resolved version satisfying ^12.0.0)"
  - "@testing-library/react v16 used — no react-test-renderer needed (uses React 19 act() directly)"
  - "pre-existing TS error in lib/__tests__/spawn-mjs.test.ts (EventEmitter type) left as-is — out of scope per CLAUDE.md surgical change rule"
metrics:
  duration_minutes: 3
  completed_date: "2026-05-20"
  tasks_completed: 3
  tasks_total: 3
  files_created: 2
  files_modified: 3
---

# Phase 04 Plan 01: Motion Foundations + Vitest Setup Summary

**One-liner:** framer-motion v12 + @testing-library installed, 5 motion variant presets encoding DESIGN.md tokens, vitest wired with jest-dom matchers for component RTL tests.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install framer-motion + testing-library deps | 6baa32f | package.json, package-lock.json |
| 2 | Create lib/motion-presets.ts with 5 named variants | 23ab86c | lib/motion-presets.ts |
| 3 | Create vitest.setup.ts and wire setupFiles in vitest.config.ts | 208c74e | vitest.setup.ts, vitest.config.ts |

## Test Counts

| Point | Test Files | Tests |
|-------|------------|-------|
| Before (Phase 1-3 baseline) | 11 | 34 |
| After (this plan) | 11 | 34 |

No regression. New include glob `components/__tests__/**` matches zero files yet (component tests come in Plan 04-02).

## Deviations from Plan

None — plan executed exactly as written.

Note: pre-existing TS error in `lib/__tests__/spawn-mjs.test.ts` (EventEmitter type annotation) was present before this plan and left untouched per surgical-change rule.

## Known Stubs

None. This plan creates infrastructure files only — no UI rendering, no data wiring.

## Self-Check: PASSED

- [x] `dashboard/web/lib/motion-presets.ts` exists, 5 `export const` exports
- [x] `dashboard/web/vitest.setup.ts` exists, imports `@testing-library/jest-dom/vitest`
- [x] `dashboard/web/vitest.config.ts` contains `setupFiles` and `components/__tests__` glob
- [x] `dashboard/web/package.json` contains `framer-motion`, `@testing-library/react`, `@testing-library/jest-dom`
- [x] 34 tests pass (no regression)
- [x] Commits 6baa32f, 23ab86c, 208c74e all exist in git log
