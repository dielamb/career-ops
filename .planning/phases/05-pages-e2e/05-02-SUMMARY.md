---
phase: 05-pages-e2e
plan: "02"
subsystem: pages
tags: [pages, pipeline, modal, table, filters, framer-motion, y2k]
dependency_graph:
  requires:
    - 05-01 (Sidebar + /today landing page, layout shell)
    - 04-02 (StatusBadge, ScoreBar, ListingCard, ProgressMeter raw + wrappers)
    - 03-01 (GET /api/listing/[id], GET /api/pipeline)
    - 03-02 (POST /api/actions/apply, POST /api/actions/mark-sent)
  provides:
    - PipelineTable raw + client wrapper (filter chips, search, sort, row click)
    - ListingModal raw + client wrapper (MD pane + PDF iframe + action bar)
    - /pipeline server page (parsePipeline direct invocation)
    - /api/file PDF passthrough route (path-traversal guarded)
  affects:
    - /pipeline route (new page)
    - ListingModal opens from row click anywhere PipelineTable is mounted
    - Phase 5 E2E tests (05-03) — /pipeline + modal now testable
tech_stack:
  added: []
  patterns:
    - raw/ server-safe + client wrapper split (same pattern as 04-02 + 05-01)
    - LayoutGroup + layout prop for Framer Motion v12 list reorder animations
    - empty-set-means-no-constraint filter UX (empty Set = all rows visible)
    - direct parser invocation in server component (no SSR self-fetch loop)
    - cancellable useEffect fetch via cancelled flag
    - 423 Locked surfaces as inline "Locked, try again" (modal stays open)
    - path-traversal guarded /api/file route for PDF serving
key_files:
  created:
    - dashboard/web/components/raw/PipelineTable.tsx
    - dashboard/web/components/PipelineTable.tsx
    - dashboard/web/components/raw/ListingModal.tsx
    - dashboard/web/components/ListingModal.tsx
    - dashboard/web/app/pipeline/page.tsx
    - dashboard/web/app/api/file/route.ts
  modified: []
decisions:
  - "filter empty-set = no constraint: toggling no chips means all rows visible. Avoids zero-rows footgun when user hasn't selected anything."
  - "LayoutGroup wraps table wrapper: Framer Motion v12 layout animations on the div; chips and row reordering spring with layoutSpring config (400/30)"
  - "/api/file included: pdfPath from /api/listing/[id] is an absolute filesystem path; iframe can't load file:// URLs. Minimal /api/file route (traversal-safe, PDF-only) is the minimum needed for PAG-03 PDF iframe. Fallback: pdfHref=null shows 'PDF unavailable' pane gracefully."
  - "modal state owned by PipelineTable client wrapper: keeps table/modal coupling tight without a global store; selectedId drives conditional render"
  - "cancellable fetch in ListingModal useEffect: cancelled flag prevents setState on unmounted component when id changes rapidly"
metrics:
  duration_minutes: 15
  completed_date: "2026-05-20"
  tasks_completed: 3
  tasks_total: 3
  files_created: 6
  files_modified: 0
---

# Phase 05 Plan 02: /pipeline Page + ListingModal Summary

**One-liner:** PipelineTable (filter chips state/source/score, search-as-you-type, score-desc sort, row click opens modal) + ListingModal (MD pane + PDF iframe + action bar wired to /api/actions/apply + /api/actions/mark-sent, 423 -> inline "Locked, try again") + /pipeline server page, build exits 0, 50/50 tests pass.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | PipelineTable raw + motion wrapper | e008279 | raw/PipelineTable.tsx, PipelineTable.tsx |
| 2 | ListingModal raw + motion wrapper + /api/file | def9896 | raw/ListingModal.tsx, ListingModal.tsx, app/api/file/route.ts |
| 3 | /pipeline server page | 5596d50 | app/pipeline/page.tsx |

## Test Counts

| Point | Test Files | Tests |
|-------|------------|-------|
| Baseline (05-01 complete) | 15 | 50 |
| After this plan | 15 | 50 |

No new test files added in this plan (E2E tests come in 05-03). All 50 existing tests pass with no regression.

## Decisions Made

1. **Filter empty-set = no constraint** — When no filter chip is active, the empty `Set` means "all rows visible". This is the conventional multi-select UX (avoids the "no chip selected = no rows" footgun). Matches the plan spec.

2. **Modal state owned by PipelineTable wrapper** — `selectedId` lives in the `PipelineTable` client wrapper. When `selectedId !== null`, `<ListingModal id={selectedId} onClose=... />` renders inside the same `LayoutGroup`. No global store needed; coupling is tight and intentional.

3. **/api/file included** — `pdfPath` from `/api/listing/[id]` is an absolute filesystem path. Browser `<iframe src="file:///abs/path">` is blocked by same-origin policy. The minimal `/api/file?path=...` route (traversal-safe, `.pdf` only, path must be under `outputDir()`) is the only way to serve the PDF. If `/api/file` were omitted, `pdfHref` would always be `null` and the right pane would show "PDF unavailable" — acceptable for a fallback but not ideal for PAG-03.

4. **Cancellable fetch pattern** — `ListingModal` `useEffect` sets a `cancelled` flag on cleanup. This prevents `setState` on an unmounted component when the user clicks a different row before the fetch resolves.

5. **LayoutGroup wraps table motion.div** — Framer Motion v12 `layout` prop on the outer `motion.div` combined with `LayoutGroup` enables spring-based reorder animations when filter chips toggle rows in/out. Uses `layoutSpring` config (stiffness 400, damping 30) from `motion-presets.ts`.

## DESIGN.md Token Coverage

| Component | Tokens Used |
|-----------|------------|
| raw/PipelineTable | `bg-paper`, `bg-ink`, `bg-cyber`, `bg-acid`, `text-ink`, `text-ink-muted`, `text-ink-soft`, `border-ink`, `border-ink-muted`, `font-display`, `font-mono`, `font-body`, `shadow-[6px_6px_0_var(--color-ink)]`, `accent-magenta` |
| raw/ListingModal | `bg-paper`, `bg-cyber`, `bg-acid`, `text-ink`, `text-ink-muted`, `text-ink-soft`, `text-magenta`, `border-ink`, `border-ink-muted`, `font-display`, `font-mono`, `font-body`, `shadow-[6px_6px_0_var(--color-ink)]`, `shadow-[3px_3px_0_var(--color-ink)]` |

## Deviations from Plan

None — plan executed exactly as written. The `/api/file` route was explicitly noted in the plan as an expected addition for PAG-03 PDF iframe support.

## Known Stubs

None. All data flows from real sources:
- PipelineTable receives live `PipelineEntry[]` from `parsePipeline()` in the server component
- ListingModal fetches live `Report` data from `/api/listing/[id]` on mount
- Action bar calls real POST routes

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: file-read | dashboard/web/app/api/file/route.ts | New GET endpoint reads files from disk; guarded by realpath check against outputDir() + .pdf-only extension filter. Path traversal mitigated. |

## Self-Check: PASSED

- [x] `dashboard/web/components/raw/PipelineTable.tsx` exists — no 'use client', filter chips, search, table rows, data-testid attrs
- [x] `dashboard/web/components/PipelineTable.tsx` exists — 'use client', LayoutGroup, ListingModal conditional render
- [x] `dashboard/web/components/raw/ListingModal.tsx` exists — no 'use client', modal-close, modal-action-open, modal-action-mark-applied, MD pane + PDF pane
- [x] `dashboard/web/components/ListingModal.tsx` exists — 'use client', ESC handler, /api/listing/ fetch, /api/actions/apply, /api/actions/mark-sent, "Locked, try again"
- [x] `dashboard/web/app/pipeline/page.tsx` exists — force-dynamic, parsePipeline(pipelinePath()), PipelineTable render
- [x] `dashboard/web/app/api/file/route.ts` exists — path traversal guard, .pdf-only, outputDir() root check
- [x] Commits e008279, def9896, 5596d50 all exist in git log
- [x] 50/50 tests pass (npm run test:run)
- [x] npm run build exits 0 (Route /pipeline compiled successfully)
- [x] TypeScript strict: only pre-existing EventEmitter error in spawn-mjs.test.ts (unrelated to this plan)
- [x] No hex literals in raw/ components
- [x] No framer-motion imports in raw/ components
