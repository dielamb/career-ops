---
phase: 03-api-routes
verified: 2026-05-20T19:29:00Z
status: passed
score: 5/5 must-haves verified
overrides_applied: 0
gaps: []
deferred: []
human_verification: []
---

# Phase 3: API Routes Verification Report

**Phase Goal:** 5 Next.js App Router API routes serve data layer to client; integration tests cover happy + negative paths.
**Verified:** 2026-05-20T19:29:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `GET /api/applications` returns valid JSON matching Zod schema (verified via `npm run test`) | VERIFIED | `app/api/__tests__/applications.test.ts` 2/2 passing; route calls `parseApplications` and returns `{ data, errors }` via `jsonOk` |
| 2 | `GET /api/listing/missing-id` returns 404 with JSON `{ error }` body | VERIFIED | `app/api/__tests__/listing.test.ts` test 2: mock returns empty data, route returns `jsonError(404, 'Listing not found')` — 404 confirmed |
| 3 | `POST /api/actions/apply` with body `{ url: "not-a-url" }` returns 400; with valid URL spawns `gstack browse` (mocked in test) | VERIFIED | `app/api/__tests__/apply.test.ts` 2/2 passing: happy path calls `openInBrowse` and returns 200 `{ ok: true }`; `InvalidUrlError` path returns 400 `{ error: 'Invalid URL' }` |
| 4 | `POST /api/actions/mark-sent` returns 423 when lock contention simulated | VERIFIED | `app/api/__tests__/mark-sent.test.ts` test 2: `lockedWrite` mock throws `LockedError`, route returns `jsonError(423, 'Locked')` |
| 5 | 10 integration tests pass (5 happy paths + 5 negative paths) | VERIFIED | `npm run test:run` → 34/34 total; `app/api/__tests__` subset = 10/10 (5 happy: applications, pipeline, listing, apply, mark-sent; 5 negative: file-not-found passthrough, malformed-row passthrough, listing 404, invalid URL 400, lock contention 423) |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `dashboard/web/app/api/applications/route.ts` | GET handler, calls parseApplications | VERIFIED | 11 lines, exports `async function GET`, imports `parseApplications` + `applicationsPath` + `jsonOk` |
| `dashboard/web/app/api/pipeline/route.ts` | GET handler, calls parsePipeline | VERIFIED | 11 lines, exports `async function GET`, imports `parsePipeline` + `pipelinePath` + `jsonOk` |
| `dashboard/web/app/api/listing/[id]/route.ts` | Dynamic GET handler with params: Promise signature | VERIFIED | 42 lines, exports `async function GET(_req, ctx: { params: Promise<{ id: string }> })`, imports `parseReports`, returns `{ report, pdfPath }` or 404 |
| `dashboard/web/app/api/actions/apply/route.ts` | POST handler with Zod + spawn-mjs | VERIFIED | 41 lines, exports `async function POST`, Zod `ApplyBody` schema, calls `openInBrowse`, catches `InvalidUrlError` → 400 and ENOENT → 503 |
| `dashboard/web/app/api/actions/mark-sent/route.ts` | POST handler with Zod + lockedWrite | VERIFIED | 88 lines, exports `async function POST`, Zod `MarkSentBody` enum, surgical cell-replacement via `applyStatusUpdate`, calls `lockedWrite`, catches `LockedError` → 423 |
| `dashboard/web/lib/api-helpers.ts` | `jsonOk` + `jsonError` shared builders | VERIFIED | Exports `jsonOk<T>` and `jsonError`, both use `NextResponse.json` |
| `dashboard/web/lib/api-paths.ts` | Path resolution helpers | VERIFIED | Exports `repoRoot`, `applicationsPath`, `pipelinePath`, `reportsDir`, `outputDir` |
| `dashboard/web/vitest.config.ts` | `environmentMatchGlobs` + `app/api/__tests__` include glob | VERIFIED | Contains `environmentMatchGlobs: [["app/api/**", "node"]]` and `app/api/__tests__/**/*.test.{ts,tsx}` in include; also has `resolve.alias` for `@/` (auto-fix documented in SUMMARY) |
| `dashboard/web/app/api/__tests__/applications.test.ts` | Happy + file-not-found passthrough tests | VERIFIED | 2 tests, `vi.mock('@/lib/parse-applications')`, imports `GET` from route |
| `dashboard/web/app/api/__tests__/pipeline.test.ts` | Happy + malformed-row passthrough tests | VERIFIED | 2 tests, `vi.mock('@/lib/parse-pipeline')`, imports `GET` |
| `dashboard/web/app/api/__tests__/listing.test.ts` | Happy + missing-id 404 tests | VERIFIED | 2 tests, `vi.mock('@/lib/parse-reports')` + `vi.mock('node:fs')` for `fs.access` |
| `dashboard/web/app/api/__tests__/apply.test.ts` | Apply happy + invalid URL 400 tests | VERIFIED | 2 tests, `vi.mock('@/lib/spawn-mjs')` preserving real `InvalidUrlError` class |
| `dashboard/web/app/api/__tests__/mark-sent.test.ts` | Mark-sent happy write + lock 423 tests | VERIFIED | 2 tests, `vi.mock('@/lib/git-commit')` + `vi.mock('node:fs')` for `readFile` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `applications/route.ts` | `lib/parse-applications.ts` | `import { parseApplications }` | VERIFIED | Line 1 import, called at line 9 |
| `pipeline/route.ts` | `lib/parse-pipeline.ts` | `import { parsePipeline }` | VERIFIED | Line 1 import, called at line 9 |
| `listing/[id]/route.ts` | `lib/parse-reports.ts` | `import { parseReports }` | VERIFIED | Line 4 import, called at line 24 |
| `listing/[id]/route.ts` | `lib/api-paths.ts` | `import { reportsDir, outputDir }` | VERIFIED | Line 5 import, called at lines 24 + 32 |
| `actions/apply/route.ts` | `lib/spawn-mjs.ts` | `import { openInBrowse, InvalidUrlError }` | VERIFIED | Line 2 import; `openInBrowse` called at line 25; `InvalidUrlError` caught at line 27 |
| `actions/mark-sent/route.ts` | `lib/git-commit.ts` | `import { lockedWrite, LockedError }` | VERIFIED | Line 3 import; `lockedWrite` called at line 75; `LockedError` caught at line 77 |
| `actions/mark-sent/route.ts` | `lib/api-paths.ts` | `import { applicationsPath }` | VERIFIED | Line 4 import, called at line 59 |
| `apply.test.ts` | `actions/apply/route.ts` | `vi.mock('@/lib/spawn-mjs') + import { POST }` | VERIFIED | `vi.mock` on line 3, `POST` imported and exercised in both tests |
| `mark-sent.test.ts` | `actions/mark-sent/route.ts` | `vi.mock('@/lib/git-commit') + import { POST }` | VERIFIED | `vi.mock` on line 3, `POST` imported and exercised in both tests |

### Data-Flow Trace (Level 4)

All five routes render data from real parsers (mocked in tests to isolate units; parsers themselves are verified by Phase 2 tests). No hardcoded empty returns in routes — each route calls its parser/library and returns the result directly.

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `applications/route.ts` | `result` | `parseApplications(applicationsPath())` | Yes — parser reads `data/applications.md` (Phase 2 verified) | FLOWING |
| `pipeline/route.ts` | `result` | `parsePipeline(pipelinePath())` | Yes — parser reads `data/pipeline.md` (Phase 2 verified) | FLOWING |
| `listing/[id]/route.ts` | `data` | `parseReports(reportsDir(), outputDir())` | Yes — parser reads `reports/*.md` (Phase 2 verified) | FLOWING |
| `actions/apply/route.ts` | N/A (action, not data) | `openInBrowse(url)` | N/A — spawns process | FLOWING |
| `actions/mark-sent/route.ts` | `current` / `next` | `fs.readFile(applicationsPath())` + `applyStatusUpdate` + `lockedWrite` | Yes — reads and writes real file | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 34 tests pass (10 API + 24 Phase 2) | `npm run test:run` | 34/34 passed in 2.16s | PASS |
| 10 API integration tests pass | `npx vitest run app/api/__tests__` | 10/10 passed | PASS |
| All 5 route dirs contain route.ts | `ls app/api/applications/ app/api/pipeline/ app/api/listing/ app/api/actions/apply/ app/api/actions/mark-sent/` | All 5 present | PASS |
| `environmentMatchGlobs` present | `grep environmentMatchGlobs vitest.config.ts` | Found | PASS |
| apply/route.ts calls openInBrowse (not validateUrl separately) | `grep openInBrowse apply/route.ts` | 1 call at line 25, no separate validateUrl call | PASS |
| mark-sent/route.ts uses lockedWrite + catches LockedError | `grep -c 'lockedWrite\|LockedError' mark-sent/route.ts` | 3 occurrences (import + call + catch) | PASS |
| update-system.mjs check | `node update-system.mjs check; echo EXIT:$?` | EXIT:0 (returns update-available JSON but exit code 0 — system layer not modified) | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| API-01 | 03-01-PLAN.md | `GET /api/applications` — 200 with JSON array of Applications | SATISFIED | Route exists, returns `{ data: Application[], errors: ParseError[] }`, 2/2 tests pass |
| API-02 | 03-01-PLAN.md | `GET /api/pipeline` — 200 with JSON array of PipelineEntries | SATISFIED | Route exists, same shape, 2/2 tests pass |
| API-03 | 03-01-PLAN.md | `GET /api/listing/[id]` — 200 with `{ report, pdfPath }` or 404 if missing | SATISFIED | Route exists, `matchesId` handles 3 id formats, pdfPath via `fs.access`, 2/2 tests pass |
| API-04 | 03-02-PLAN.md | `POST /api/actions/apply` — 200 on valid URL spawn / 400 on invalid URL | SATISFIED | Route Zod-validates body, calls `openInBrowse`, maps `InvalidUrlError` → 400, ENOENT → 503, 2/2 tests pass |
| API-05 | 03-02-PLAN.md | `POST /api/actions/mark-sent` — 200 on lock+write / 423 Locked on contention | SATISFIED | Route Zod-validates body with status enum, surgical cell-replacement, `lockedWrite`, `LockedError` → 423, 2/2 tests pass |
| TST-04 | 03-01-PLAN.md + 03-02-PLAN.md | 5 integration tests for API routes (one per route, plus 404/400/423 negative paths) | SATISFIED | 10 integration tests pass: 5 happy + 5 negative (exceeds the base-5 count stated in REQUIREMENTS.md) |

### Anti-Patterns Found

No blockers or warnings. Scanned all 5 route files and 5 test files for:
- TODO/FIXME/placeholder comments: none
- `return null`, `return {}`, `return []` stubs: none
- Hardcoded empty data without fetch: none
- Console.log-only implementations: none
- Form handlers that only call `preventDefault`: N/A (no React components)

All routes have substantive implementations with real parser/library calls. All tests mock dependencies and assert on real response shapes.

### Human Verification Required

None. All success criteria are verifiable programmatically via the test suite.

### Gaps Summary

No gaps. All 5 ROADMAP success criteria are fully satisfied:

1. `GET /api/applications` — verified by 2 tests (happy + file-not-found passthrough)
2. `GET /api/listing/missing-id` returns 404 — verified by listing test 2
3. `POST /api/actions/apply` — 400 on bad URL, 200 + spawn on valid URL — verified by 2 tests
4. `POST /api/actions/mark-sent` — 423 on lock contention — verified by mark-sent test 2
5. 10 integration tests pass — confirmed: `npm run test:run` shows 10/10 in `app/api/__tests__`

Phase 2 regression: 0 failures (34/34 total including 24 prior Phase 2 tests).

`update-system.mjs check` exits 0 — no system-layer files were modified.

---

_Verified: 2026-05-20T19:29:00Z_
_Verifier: Claude (gsd-verifier)_
