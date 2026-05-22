---
phase: "06"
plan: "dashboard-improvements"
subsystem: "dashboard/web"
tags: [dashboard, ui, api, background-spawn, filters, command-palette]
dependency_graph:
  requires: ["05-pages-e2e-03"]
  provides: ["scan-button", "find-contacts", "cover-letter", "quick-add-url", "inline-status", "filter-persistence", "command-palette"]
  affects: ["dashboard/web/app", "dashboard/web/components", "dashboard/web/lib"]
tech_stack:
  added: []
  patterns: ["detached-spawn-with-log", "poll-mtime-done", "optimistic-ui-update", "localstorage-filter-persistence", "context-toast-provider"]
key_files:
  created:
    - dashboard/web/components/Toast.tsx
    - dashboard/web/components/ScanButton.tsx
    - dashboard/web/components/AddUrlWidget.tsx
    - dashboard/web/components/CommandPalette.tsx
    - dashboard/web/app/api/actions/scan/route.ts
    - dashboard/web/app/api/actions/scan/status/route.ts
    - dashboard/web/app/api/actions/contacto/route.ts
    - dashboard/web/app/api/actions/contacto/status/route.ts
    - dashboard/web/app/api/actions/cover/route.ts
    - dashboard/web/app/api/actions/cover/status/route.ts
    - dashboard/web/app/api/actions/add-url/route.ts
  modified:
    - dashboard/web/app/layout.tsx
    - dashboard/web/components/raw/TodayHero.tsx
    - dashboard/web/components/raw/ListingModal.tsx
    - dashboard/web/components/ListingModal.tsx
    - dashboard/web/components/raw/PipelineTable.tsx
    - dashboard/web/components/PipelineTable.tsx
    - dashboard/web/components/raw/Sidebar.tsx
    - dashboard/web/components/Sidebar.tsx
decisions:
  - "detached spawn + log file polling chosen over SSE/WebSocket — simpler, stateless, survives request lifecycle"
  - "mtime-based done detection (>8s idle) for claude -p outputs — avoids parsing LLM output format"
  - "localStorage filter persistence in client component state initializer — SSR-safe typeof window guard"
  - "optimistic status update in PipelineTable: instant UI, revert on error — no full page reload needed"
  - "CommandPalette fetches on open (lazy) — avoids loading all data on every page render"
metrics:
  duration: "~45 min"
  completed: "2026-05-21"
  tasks: 7
  files: 19
---

# Phase 06: Dashboard Improvements Summary

7 dashboard improvements shipped on `fix/dashboard-bugs` branch, each as an atomic commit. Build passes, 50/50 tests green.

## Features Shipped

### A: Run Scan Button (commits: 9b908bb)
POST `/api/actions/scan` spawns `node scan.mjs` detached with log to `/tmp/career-ops-scan-{ts}.log`. `ScanButton` component polls GET `/api/actions/scan/status` every 5s, shows toast "Scan started" → "Scan complete: N offers". Mounted in `/today` header.

`ToastProvider` context created: bottom-right floating toasts, font-mono uppercase, 4s auto-dismiss, `info`/`success`/`error` variants.

### B: Find Contacts (commit: 3b772af)
POST `/api/actions/contacto` spawns `claude -p @contacto.md company={name}` detached. `[Find Contacts]` button in ListingModal footer polls status endpoint, renders result via `MarkdownProse` inline below report body.

### C: Generate Cover Letter (commit: 3b772af)
POST `/api/actions/cover` spawns `claude -p @oferta.md cover listing={id}` detached. `[Cover Letter]` button in ListingModal footer polls status, renders result with `[Copy]` clipboard button. Generates draft for user review only — no auto-submit.

### D: Quick Add URL (commit: c37fc99)
POST `/api/actions/add-url` validates URL via `validateUrl()` from `spawn-mjs.ts`, spawns `claude -p @oferta.md {url}` detached. `AddUrlWidget` in Sidebar footer: paste URL → Enter or `[+ Add URL]` → toast "Evaluation started". Sidebar raw component extended with optional `footer` slot.

### E: Inline Status Changer (commit: 113bfce)
New "App Status" column in PipelineTable with `<select>` dropdown per row (only rows with a num/id). `stopPropagation` prevents row-click conflict. `handleStatusChange` POSTs `/api/actions/mark-sent` with optimistic update, reverts on error.

### F: Filter Persistence (commit: 113bfce)
`PipelineTable` client wrapper initialises all 4 filter states from `localStorage.getItem('careerops-pipeline-filters')` with SSR-safe `typeof window` guard. `useEffect` persists JSON `{activeStates, activeSources, minScore, search}` on every change.

### G: Cmd+K Command Palette (commit: 933fbf0)
`CommandPalette` component: global `Cmd+K`/`Ctrl+K` listener, ESC to close, fetches `/api/applications` + `/api/pipeline` on open. Substring search, top 20 results, keyboard navigation (ArrowUp/Down/Enter). Y2K aesthetic: ink/60 overlay, centered card. Mounted in `layout.tsx`.

## Deviations from Plan

None — plan executed exactly as described. All security constraints followed:
- All spawns use array-form (never shell-interpolated)
- `validateUrl` applied to all URL inputs
- `claude -p` prompts passed as array arg, no string interpolation of user data
- Contacto/Cover outputs are read-only drafts — no auto-submit path

## Known Stubs

None. All features are fully wired:
- Scan polls and reports completion count
- Contacto/Cover poll and render real LLM output
- AddUrl fires real evaluation spawn
- Inline status actually POSTs mark-sent
- Filter persistence actually reads/writes localStorage
- CommandPalette actually fetches and navigates

## Self-Check: PASSED

All 11 created/modified files found on disk. All 5 feature commits verified in git log.
Tests: 50/50 passing. Build: exits 0, all 7 new API routes in build output.
