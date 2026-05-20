# Roadmap — career-ops Dashboard

**5 phases** | **30 requirements** | All v1 requirements covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Foundation | 2/2 | Complete    | 2026-05-20 |
| 2 | Data Layer | 3/3 | Complete    | 2026-05-20 |
| 3 | API Routes | 2/2 | Complete    | 2026-05-20 |
| 4 | Components | Magic MCP raw + motion-wrapped components + tests | COM-01..04, TST-05 | 4 |
| 5 | Pages + E2E | /today, /pipeline, listing modal + 3 Playwright E2E | PAG-01..05, TST-06 | 5 |

---

### Phase Details

#### Phase 1: Foundation

**Goal**: Stand up Next.js 15 app skeleton in `dashboard/web/` with DESIGN.md tokens wired into Tailwind v4 and Vitest + Playwright test infrastructure ready.

**Requirements**: FND-01, FND-02, FND-03, FND-04

**Success criteria**:
1. `npm run dev` (from `dashboard/web/`) serves http://localhost:3000 with empty `app/page.tsx` rendering DESIGN.md typography (Bricolage Grotesque headline visible)
2. Tailwind v4 config exposes all DESIGN.md tokens — `bg-paper`, `text-ink`, `accent-cyber`, `accent-magenta`, `accent-acid`, `font-display`, `font-body`, `font-mono` all usable
3. `npm run test` (vitest) passes empty smoke test; `npm run test:e2e` (playwright) passes empty smoke test
4. `node test-all.mjs --dashboard` runs both vitest and playwright targets; `npm run update:check` (santifer) still passes (no system-layer touches)

**UI hint**: yes — frontend scaffold phase

**Worktree parallelization**: Sequential — must precede all other phases

**Plans:** 2/2 plans complete
- [x] 01-01-PLAN.md — Scaffold Next.js 15 + Tailwind v4 DESIGN.md tokens + Y2K smoke page (FND-01, FND-02)
- [x] 01-02-PLAN.md — Vitest + Playwright + test-all.mjs --dashboard integration; verify santifer compatibility (FND-03, FND-04)

#### Phase 2: Data Layer

**Goal**: All MD/TSV parsers, child_process spawn safety, and lock-guarded writes implemented and unit-tested.

**Requirements**: DAT-01, DAT-02, DAT-03, DAT-04, DAT-05, DAT-06, DAT-07, TST-01, TST-02, TST-03

**Success criteria**:
1. `parseApplications('data/applications.md')` returns typed array of 81 Application records; malformed row test passes (single bad row skipped + warning collected, rest parses)
2. `parsePipeline('data/pipeline.md')` returns typed array of 111 PipelineEntry records with same error boundary
3. `spawnMjs` rejects URL with shell metacharacters at validator step (test asserts no spawn call made when URL contains backtick/`$()`/`;`)
4. `lockedWrite` survives concurrent writes — second writer receives `LockedError` after 5s timeout
5. `npm run test` reports 23 passing tests (14 parser + 5 spawn + 4 lock)

**UI hint**: no

**Worktree parallelization**: After Phase 1; can run alongside Phase 3 (no shared files within `dashboard/web/lib/` after Phase 1 contract is set)

**Plans:** 3/3 plans complete
- [x] 02-01-PLAN.md — Install Phase 2 deps (zod, gray-matter, proper-lockfile, remark, papaparse) + lib/schemas.ts with 4 Zod schemas + ParseError (DAT-07)
- [x] 02-02-PLAN.md — 3 MD parsers (applications/pipeline/reports) + 14 vitest tests with per-row error boundary (DAT-01, DAT-02, DAT-03, DAT-06, TST-01)
- [x] 02-03-PLAN.md — spawn-mjs (array-form + URL validator) + git-commit (proper-lockfile wrapper) + 9 vitest tests (DAT-04, DAT-05, TST-02, TST-03)

#### Phase 3: API Routes

**Goal**: 5 Next.js App Router API routes serve data layer to client; integration tests cover happy + negative paths.

**Requirements**: API-01, API-02, API-03, API-04, API-05, TST-04

**Success criteria**:
1. `GET /api/applications` returns valid JSON matching Zod schema (verified via `npm run test`)
2. `GET /api/listing/missing-id` returns 404 with JSON `{ error }` body
3. `POST /api/actions/apply` with body `{ url: "not-a-url" }` returns 400; with valid URL spawns `gstack browse` (mocked in test)
4. `POST /api/actions/mark-sent` returns 423 when lock contention simulated
5. 10 integration tests pass (5 happy paths + 5 negative paths)

**UI hint**: no

**Worktree parallelization**: After Phase 2

**Plans:** 2/2 plans complete
- [x] 03-01-PLAN.md — GET routes (applications, pipeline, listing/[id]) + shared api-helpers/api-paths + vitest node-env config + 6 tests (API-01, API-02, API-03, TST-04 partial)
- [x] 03-02-PLAN.md — POST action routes (apply with Zod+spawn-mjs, mark-sent with Zod+lockedWrite) + 4 tests (API-04, API-05, TST-04 partial)

#### Phase 4: Components

**Goal**: 4 base components generated via magic MCP into `components/raw/`, motion-wrapped versions exported from `components/`, all consume DESIGN.md tokens.

**Requirements**: COM-01, COM-02, COM-03, COM-04, TST-05

**Success criteria**:
1. `components/raw/StatusBadge.tsx`, `ScoreBar.tsx`, `ListingCard.tsx`, `ProgressMeter.tsx` exist and use only Tailwind classes mapped to DESIGN.md tokens (no hex literals)
2. `components/StatusBadge.tsx` (motion-wrapped) imports raw + applies `fadeUp` variant — render test confirms motion props attached
3. `lib/motion-presets.ts` exports 5 variants (`fadeUp`, `scoreCountUp`, `pixelBootUp`, `layoutSpring`, `chromaticFlash`) with correct shape (initial/animate/transition keys)
4. 4 component unit tests pass via React Testing Library + Vitest

**UI hint**: yes — design system components

**Worktree parallelization**: After Phase 3

**Plans:** 2 plans
- [ ] 04-01-PLAN.md — Install framer-motion + testing-library, create lib/motion-presets.ts (5 variants), wire vitest setupFiles for jest-dom (COM-03)
- [ ] 04-02-PLAN.md — 4 raw components + 4 motion wrappers + 4 RTL tests (COM-01, COM-02, COM-04, TST-05)

#### Phase 5: Pages + E2E

**Goal**: `/today`, `/pipeline`, and listing modal ship with full DESIGN.md aesthetic; 3 Playwright E2E tests cover critical user flows.

**Requirements**: PAG-01, PAG-02, PAG-03, PAG-04, PAG-05, TST-06

**Success criteria**:
1. `/today` renders ProgressMeter (52/81/64%) + 3 follow-up cards (Fever overdue in magenta) + Top 5 to Apply (Fever 4.58 first); pixelBootUp animation on mount
2. `/pipeline` table renders 192 rows; filter chip "Applied" reduces visible rows correctly; search "fever" filters to 1 row; layout animations on filter change
3. Listing modal opens from `/pipeline` row click; report MD renders on left; PDF iframe loads on right; [Mark Applied] closes modal + refreshes pipeline
4. E2E `apply-flow.spec.ts` passes: open /today → click [Open] on Fever → mock browse spawn invoked → toast appears
5. E2E `mark-sent-lock.spec.ts` + `malformed-md.spec.ts` pass

**UI hint**: yes — primary user-facing surfaces

**Worktree parallelization**: After Phase 4 (depends on components)

---

## Coverage Validation

All 30 v1 requirements mapped to exactly one phase ✓.

| Category | Requirements | Phase | Coverage |
|----------|--------------|-------|----------|
| Foundation | FND-01..04 | 1 | 4/4 ✓ |
| Data | DAT-01..07 | 2 | 7/7 ✓ |
| API | API-01..05 | 3 | 5/5 ✓ |
| Components | COM-01..04 | 4 | 4/4 ✓ |
| Pages | PAG-01..05 | 5 | 5/5 ✓ |
| Tests | TST-01..06 | 2-5 (paired) | 6/6 ✓ |

## Execution Order

Sequential: 1 → 2 → 3 → 4 → 5. Phase 2 and Phase 3 can overlap if data layer contract is firm after Phase 2 mid-checkpoint.

## Dependencies

- Phase 1 must produce stable Tailwind config + test runners before Phase 2-5 can use them
- Phase 4 depends on DESIGN.md tokens being live (Phase 1 done)
- Phase 5 depends on Phases 3 (API) and 4 (components)
- TST-06 (E2E) depends on full app being navigable (Phase 5 implementation alongside tests)

---
*Generated: 2026-05-20 (auto mode via /gsd-new-project, scope-reduced Approach C from /office-hours + /plan-eng-review)*
