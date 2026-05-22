# v1 Requirements — career-ops Dashboard

## v1 Requirements

### Foundation (FND)

- [ ] **FND-01**: Next.js 15 + React 19 + TypeScript strict scaffold in `dashboard/web/`
- [ ] **FND-02**: Tailwind v4 config exposes DESIGN.md tokens (Y2K Bricolage Grotesque + General Sans + IBM Plex Mono + cream + triple-neon)
- [ ] **FND-03**: Vitest config + Playwright config + `test-all.mjs --dashboard` target wired
- [ ] **FND-04**: `dashboard/web/` confirmed isolated from santifer system layer (npm `update:check` still passes)

### Data Layer (DAT)

- [ ] **DAT-01**: `lib/parse-applications.ts` parses `data/applications.md` (81 rows) with Zod schema
- [ ] **DAT-02**: `lib/parse-pipeline.ts` parses `data/pipeline.md` (111 rows) with Zod schema
- [ ] **DAT-03**: `lib/parse-reports.ts` parses `reports/*.md` and locates `output/*.pdf` companions
- [ ] **DAT-04**: `lib/spawn-mjs.ts` uses `spawn(cmd, [args])` array form; URL validator (`new URL` + http/https only)
- [ ] **DAT-05**: `lib/git-commit.ts` wraps writes in `proper-lockfile` with stale-lock recovery
- [ ] **DAT-06**: Per-row error boundary in parsers — bad row skipped + toast warning, never crash dashboard
- [x] **DAT-07**: `lib/schemas.ts` defines shared Zod schemas (Application, PipelineEntry, Report)

### API Routes (API)

- [ ] **API-01**: `GET /api/applications` — 200 with JSON array of Applications
- [ ] **API-02**: `GET /api/pipeline` — 200 with JSON array of PipelineEntries
- [ ] **API-03**: `GET /api/listing/[id]` — 200 with `{ report, pdfPath }` or 404 if missing
- [ ] **API-04**: `POST /api/actions/apply` — 200 on valid URL spawn / 400 on invalid URL
- [ ] **API-05**: `POST /api/actions/mark-sent` — 200 on lock+write / 423 Locked on contention

### Components (COM)

- [ ] **COM-01**: Magic MCP generates 4 base components into `dashboard/web/components/raw/`: StatusBadge, ScoreBar, ListingCard, ProgressMeter
- [ ] **COM-02**: `dashboard/web/components/` exports motion-wrapped versions using `lib/motion-presets.ts` (Framer Motion v12 variants)
- [ ] **COM-03**: `lib/motion-presets.ts` defines `fadeUp`, `scoreCountUp`, `pixelBootUp`, `layoutSpring`, `chromaticFlash`
- [ ] **COM-04**: All components consume CSS variables from DESIGN.md tokens (no hard-coded colors/fonts)

### Pages (PAG)

- [ ] **PAG-01**: `/today` hero page — ProgressMeter (52/81/64%) + Follow-ups Today section (overdue in magenta) + Top 5 to Apply (scored, sorted)
- [ ] **PAG-02**: `/pipeline` table page — sortable/filterable over 192 rows, filter chips (status, source, score range), search-as-you-type, layout animations
- [ ] **PAG-03**: Listing modal — opens from `/pipeline` row click, side-by-side: left = report MD rendered, right = PDF iframe, action bar [Open in Chrome] [Mark Applied] [Mark Discarded]
- [ ] **PAG-04**: Sidebar nav (Today / Pipeline / Reports / Settings) — active-state Y2K styling per DESIGN.md
- [ ] **PAG-05**: Hero `Today.` page entrance uses pixelBootUp motion preset

### Tests (TST)

- [ ] **TST-01**: 14 unit tests across `lib/parse-*.ts` (happy, empty, missing file, malformed row, schema fail × each parser)
- [ ] **TST-02**: 5 unit tests for `lib/spawn-mjs.ts` (valid URL, invalid URL, shell metachar safe, script ENOENT, spawn failure)
- [ ] **TST-03**: 4 unit tests for `lib/git-commit.ts` (lock+write happy, contention retry, stale recovery, timeout)
- [ ] **TST-04**: 5 integration tests for API routes (one per route, plus 404/400/423 negative paths)
- [ ] **TST-05**: 4 component tests (React Testing Library + Vitest) for StatusBadge / ScoreBar / ListingCard / ProgressMeter
- [ ] **TST-06**: 3 Playwright E2E — apply flow happy path, mark-sent lock contention, malformed MD toast

## v2 Requirements (deferred)

- `/stats` charts screen (funnel, score distribution, time-to-response, source effectiveness, time-series)
- `/follow-ups` dedicated screen (calendar/list view, drafts from templates/)
- OS notifications for overdue follow-ups
- macOS LaunchAgent auto-start
- chokidar live-watch on `data/` files
- Auto-commit MD changes after each action
- Dark mode (DESIGN.md tokens prepared but not wired)

## Out of Scope

- **Auto-submit applications** — explicit ethical-use rule per `AGENTS.md`. Dashboard opens browser; user submits manually.
- **Multi-user / auth** — single-user product by design.
- **Database migration** — MD/TSV remain source of truth per `DATA_CONTRACT.md`.
- **Production deploy** — localhost-only.
- **TUI replacement** — Go bubbletea TUI stays alongside.
- **santifer system layer modifications** — fork integrity preserved.

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| FND-01 to FND-04 | Phase 1 | Pending |
| DAT-01 to DAT-07 | Phase 2 | Pending |
| API-01 to API-05 | Phase 3 | Pending |
| COM-01 to COM-04 | Phase 4 | Pending |
| PAG-01 to PAG-05 | Phase 5 | Pending |
| TST-01 to TST-05 | Phase 2-4 (paired with code) | Pending |
| TST-06 | Phase 5 | Pending |

---
*Last updated: 2026-05-20 after initialization*
