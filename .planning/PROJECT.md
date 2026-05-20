# career-ops Dashboard

## What This Is

Local Next.js web dashboard layered on top of career-ops AI job-search pipeline (santifer fork). Aggregates `data/applications.md` (81 rows), `data/pipeline.md` (111 pending), `reports/*.md` and `output/*.pdf` into a single interactive view with 3 screens (`/today`, `/pipeline`, listing modal). Single-user tool for Michał Maciejewski during active job search; doubles as portfolio piece visible during screen-share interviews.

## Core Value

**Open dashboard each morning and immediately know: who needs a follow-up today, which top-5 listings to apply to next, and where overall progress stands** — without grep, without context-switching across reports/output/pipeline files.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] REQ-FND-01: Next.js 15 + Tailwind v4 + TypeScript scaffold in `dashboard/web/` (does not break santifer update path)
- [ ] REQ-FND-02: DESIGN.md Y2K tokens wired into Tailwind config (Bricolage Grotesque + General Sans + IBM Plex Mono + cream paper bg + triple-neon accent)
- [ ] REQ-FND-03: Vitest + Playwright + `test-all.mjs --dashboard` target integrated
- [ ] REQ-DAT-01: Parse `data/applications.md` (81 rows) with Zod schema + per-row error boundary
- [ ] REQ-DAT-02: Parse `data/pipeline.md` (111 rows) with same schema/error pattern
- [ ] REQ-DAT-03: Parse `reports/*.md` (extract A-F sections) + locate companion `output/*.pdf`
- [ ] REQ-DAT-04: `spawn-mjs.ts` uses `child_process.spawn(cmd, [args])` array form; URL validator rejects non-http(s) + shell metacharacters
- [ ] REQ-DAT-05: `git-commit.ts` writes guarded by `proper-lockfile` (stale-lock recovery built in)
- [ ] REQ-API-01: `GET /api/applications` returns parsed applications JSON
- [ ] REQ-API-02: `GET /api/pipeline` returns parsed pipeline JSON
- [ ] REQ-API-03: `GET /api/listing/[id]` returns report MD + PDF path; 404 on missing
- [ ] REQ-API-04: `POST /api/actions/apply` validates URL + spawns gstack browse headed; 400 on invalid URL
- [ ] REQ-API-05: `POST /api/actions/mark-sent` locks MD, updates row, releases lock; 423 on contention
- [ ] REQ-COM-01: magic MCP generates 4 base components into `components/raw/` (StatusBadge, ScoreBar, ListingCard, ProgressMeter); raw stays untouched
- [ ] REQ-COM-02: Motion wrappers in `components/` apply Framer Motion v12 variants from `lib/motion-presets.ts` (fadeUp, scoreCountUp, layoutSpring, chromaticFlash)
- [ ] REQ-PAG-01: `/today` renders ProgressMeter + Follow-ups Today (overdue magenta highlight) + Top 5 to Apply (sorted by score)
- [ ] REQ-PAG-02: `/pipeline` renders sortable/filterable table over 192 rows (filter chips: status, source, score range; search-as-you-type)
- [ ] REQ-PAG-03: Listing modal opens from `/pipeline` row, side-by-side report MD + PDF iframe, action bar with [Open in Chrome] [Mark Applied] [Mark Discarded]
- [ ] REQ-TST-01: 32 unit tests covering parsers (14), spawn (5), lock (4), API routes (5), components (4)
- [ ] REQ-TST-02: 3 Playwright E2E: apply flow, mark-sent locking, malformed MD toast

### Out of Scope (deferred)

- `/stats` charts screen — dead-weight risk admitted in design doc; add only when dashboard becomes daily-driver and stats vacuum is real
- `/follow-ups` dedicated screen — folded into `/today`; separate page deferred
- Auto-commit MD changes after every action — keeps git log noisy; user commits manually via `git diff data/`
- chokidar live-watch on `data/` files — revalidate on user action sufficient; live watch is dev-time nice-to-have
- OS notifications for overdue follow-ups — UI badge only in v1
- macOS LaunchAgent auto-start — manual `npm run dev` in v1
- Auto-submit applications — explicit ethical-use rule in `AGENTS.md`; dashboard opens browser, user submits
- TUI Go bubbletea replacement — TUI stays for SSH workflow; web is additive

## Context

- **Forked repo**: santifer/career-ops, branch `fix/pdf-signature-and-filter`. `update-system.mjs` auto-pulls system layer; `dashboard/web/` lives entirely in user layer per `DATA_CONTRACT.md`.
- **Single-user product**: only Michał uses this. No auth, no multi-tenant, no public deploy.
- **Existing artifacts to honor**:
  - `dashboard/main.go` + `dashboard/internal/` — Go TUI bubbletea, stays alongside (NOT replaced)
  - `dashboard/index.html` — santifer's static dashboard, untouched
  - `~60 *.mjs` scripts (scan, merge, verify, followup-cadence, analyze-patterns, generate-pdf, etc.) — reused via `spawn-mjs.ts`
- **MD/TSV as source of truth** — no database. Dashboard reads/writes MD files atomically with lockfile.
- **Stack pre-decided** (from design doc + eng review): Next.js 15 + React 19 + TypeScript strict + Tailwind v4 + Framer Motion v12 + magic MCP (21st.dev). `proper-lockfile`, `zod`, `gray-matter`, `remark` for data layer.
- **DESIGN.md locked** (Y2K maximalist, light cream + triple neon, Bricolage Grotesque display).
- **Prior pipeline phases complete**: 7 office-hours decisions, 6 eng-review decisions, 3 design-consultation decisions. All artifacts in `~/.gstack/projects/santifer-career-ops/`.

## Constraints

- **Tech stack**: Locked to Next.js 15 + React 19 + Tailwind v4 + Framer Motion v12 + magic MCP — no substitutions without explicit re-review.
- **File layout**: `dashboard/web/` only — must not touch santifer system layer (`update-system.mjs`, `templates/`, `modes/`, etc.) per `DATA_CONTRACT.md`.
- **Data contract**: MD/TSV remain source of truth; no SQLite/Postgres migration.
- **Security**: `spawn` array form mandatory; URL validator rejects non-http(s); `proper-lockfile` mandatory on MD writes; no auto-submit of applications.
- **Performance**: Single-user, 192 MD rows — performance is non-issue. No premature optimization.
- **Distribution**: localhost-only (`npm run dev`). No production deploy, no CI/CD pipeline beyond `test-all.mjs --dashboard`.
- **Update compatibility**: santifer `update-system.mjs check` must continue to pass — no edits to system-layer files.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Approach C (Hybrid) — 20 files, 3 screens + modal | Step 0 complexity gate triggered (33 files); reduced to deliver core value without dead weight | — Pending |
| Y2K maximalist aesthetic | User pivoted from quiet-command-center after preview; portfolio-piece value + interview talking point; warm cream bg keeps daily-use anxiety low | — Pending |
| Wrapper pattern (`components/raw/` + `components/`) | Magic MCP regenerates won't overwrite custom motion code | — Pending |
| `child_process.spawn` array form (no shell) | URLs come from web scrapers; shell injection vector eliminated at source | — Pending |
| `proper-lockfile` over optimistic lock | Server-side lock = standard; optimistic locking would push retry UI complexity to client | — Pending |
| Zod + per-row error boundary on MD parsers | Single bad row must not crash whole dashboard; corrupt-row toast > 500 error | — Pending |
| Vitest + Playwright (not Jest) | Next.js 15 native, ESM-first, 100x faster; Playwright already in gstack ecosystem | — Pending |
| Skip `/stats` + `/follow-ups` screens | Dead-weight risk admitted in design doc; revisit only if dashboard becomes daily-driver and gap is real | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-20 after initialization (auto mode from /gsd-new-project, synthesized from /office-hours + /plan-eng-review + /design-consultation outputs)*
