---
phase: 03-api-routes
plan: "01"
subsystem: api
tags: [api, nextjs, app-router, vitest, integration-tests, tdd]
dependency_graph:
  requires: [02-data-layer/02-02, 02-data-layer/02-01]
  provides: [GET /api/applications, GET /api/pipeline, GET /api/listing/[id], lib/api-helpers, lib/api-paths]
  affects: [03-api-routes/03-02, 04-components, 05-pages]
tech_stack:
  added: []
  patterns: [Next.js 15 App Router GET handlers, vitest environmentMatchGlobs for node env, TDD red-green]
key_files:
  created:
    - dashboard/web/app/api/applications/route.ts
    - dashboard/web/app/api/pipeline/route.ts
    - dashboard/web/app/api/listing/[id]/route.ts
    - dashboard/web/lib/api-helpers.ts
    - dashboard/web/lib/api-paths.ts
    - dashboard/web/app/api/__tests__/applications.test.ts
    - dashboard/web/app/api/__tests__/pipeline.test.ts
    - dashboard/web/app/api/__tests__/listing.test.ts
  modified:
    - dashboard/web/vitest.config.ts
decisions:
  - "Parser errors passed through as 200 with errors[] — not promoted to HTTP 5xx; UI surfaces via toast"
  - "dynamic = force-dynamic on all three routes; no revalidate export"
  - "GET handlers are zero-arg for /applications and /pipeline; listing uses (req, ctx) with params: Promise<{id}>"
  - "matchesId supports three id formats: full 001-slug-date, slug-only, num-only"
  - "vitest resolve.alias @/ added to fix path resolution for app/api/** imports under node env"
metrics:
  duration_seconds: 235
  completed_date: "2026-05-20"
  tasks_total: 3
  tasks_completed: 3
  files_created: 8
  files_modified: 1
---

# Phase 3 Plan 01: API Routes (GET endpoints) Summary

Three Next.js 15 App Router GET routes wired to Phase 2 parsers over HTTP with 6 vitest integration tests (3 happy + 3 negative).

## What Was Built

- `GET /api/applications` — calls `parseApplications(applicationsPath())`, returns `{ data: Application[], errors: ParseError[] }` with `200`
- `GET /api/pipeline` — calls `parsePipeline(pipelinePath())`, returns same shape
- `GET /api/listing/[id]` — calls `parseReports(reportsDir(), outputDir())`, finds report by `001-slug-date` / slug / num, returns `{ report, pdfPath }` at `200` or `{ error: 'Listing not found' }` at `404`
- `lib/api-helpers.ts` — `jsonOk` + `jsonError` shared response builders (used by all 3 routes + Plan 02)
- `lib/api-paths.ts` — `repoRoot`, `applicationsPath`, `pipelinePath`, `reportsDir`, `outputDir` (single source of truth for `../../` resolution)
- `vitest.config.ts` — `environmentMatchGlobs` forces `app/api/**` tests to `node` env; `resolve.alias` wires `@/` for vitest module resolution

## Test Results

- **30/30 tests pass** (1 smoke + 23 Phase 2 + 6 Phase 3 GET)
- `app/api/__tests__/applications.test.ts`: 2/2 (happy path + file-not-found passthrough)
- `app/api/__tests__/pipeline.test.ts`: 2/2 (happy path + malformed-row passthrough)
- `app/api/__tests__/listing.test.ts`: 2/2 (happy path + 404 missing id)
- Phase 2 regression: 0 failures

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `2e50f8f` | vitest node env + api-helpers + api-paths shared modules |
| 2 | `33e93f8` | GET /api/applications + GET /api/pipeline routes + 4 integration tests |
| 3 | `85a75bf` | GET /api/listing/[id] dynamic route + 2 integration tests |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added `resolve.alias` to vitest.config.ts for `@/` path resolution**
- **Found during:** Task 2 (RED phase) — tests failed with "Cannot find module '@/app/api/applications/route'"
- **Issue:** vitest doesn't automatically pick up tsconfig `paths` entries; `@/` alias was only configured for TypeScript, not for the Vite/vitest resolver
- **Fix:** Added `resolve: { alias: { "@": path.resolve(__dirname, ".") } }` to `vitest.config.ts`
- **Files modified:** `dashboard/web/vitest.config.ts`
- **Commit:** `33e93f8`

## Known Stubs

None — all routes wire to real Phase 2 parsers. Path helpers resolve to real filesystem paths.

## Threat Flags

None — all threats accepted per localhost-only stance (T-03-01 through T-03-06 documented in plan threat model).

## Self-Check: PASSED

All 9 files exist on disk. All 3 task commits verified in git log. 30/30 tests passing.
