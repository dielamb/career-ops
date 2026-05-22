---
phase: 03-api-routes
plan: "02"
subsystem: api
tags: [api, nextjs, app-router, vitest, spawn, lockfile, zod, post, tdd]
dependency_graph:
  requires: [03-api-routes/03-01, 02-data-layer/02-03]
  provides: [POST /api/actions/apply, POST /api/actions/mark-sent]
  affects: [04-components, 05-pages]
tech_stack:
  added: []
  patterns: [Next.js 15 App Router POST handlers, Zod inline body validation, TDD red-green, lockedWrite atomic write, array-form spawn security]
key_files:
  created:
    - dashboard/web/app/api/actions/apply/route.ts
    - dashboard/web/app/api/actions/mark-sent/route.ts
    - dashboard/web/app/api/__tests__/apply.test.ts
    - dashboard/web/app/api/__tests__/mark-sent.test.ts
  modified: []
decisions:
  - "openInBrowse called directly (not validateUrl separately) - openInBrowse already calls validateUrl internally; double-call would create divergent code paths"
  - "Surgical cell-replacement used (not parseApplications+reserialize) - preserves exact whitespace/formatting, avoids diff churn"
  - "id matched against cells[0].trim() only - accepts numeric string only (Phase 5 passes String(app.num))"
  - "LockedError maps to 423 Locked - client retries on user action; single-user product so contention is rare"
  - "ENOENT on BROWSE_BIN maps to 503 - informative error for dev machines where gstack browse not installed"
metrics:
  duration_seconds: 137
  completed_date: "2026-05-20"
  tasks_total: 2
  tasks_completed: 2
  files_created: 4
  files_modified: 0
---

# Phase 3 Plan 02: POST Action Routes Summary

Two Next.js 15 App Router POST routes (apply + mark-sent) with Zod validation, spawn security, lockfile-guarded writes, and 4 vitest integration tests (2 happy + 2 negative).

## What Was Built

- `POST /api/actions/apply` — accepts `{ url }` body; Zod validates shape; `openInBrowse(url)` spawns `gstack browse goto <url>` (array form, shell:false); `InvalidUrlError` → 400; ENOENT → 503; per AGENTS.md: opens browser, user submits manually — no auto-submit
- `POST /api/actions/mark-sent` — accepts `{ id, status }` body; Zod validates shape + status enum; reads `applications.md`, surgically rewrites matching row's status cell, `lockedWrite` for atomic MD write; `LockedError` → 423; 404 on unknown id
- Both routes reuse `lib/api-helpers.ts` (`jsonOk`/`jsonError`) and `lib/api-paths.ts` (`applicationsPath`) from Plan 01

## Test Results

- **34/34 tests pass** (30 Phase 1-2 prior + 4 new POST tests)
- `app/api/__tests__/apply.test.ts`: 2/2 (happy spawn 200 + invalid URL 400)
- `app/api/__tests__/mark-sent.test.ts`: 2/2 (happy write 200 + lock contention 423)
- Phase 1-3 GET regression: 0 failures

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `e3c3d82` | POST /api/actions/apply route + 2 tests |
| 2 | `0bb067c` | POST /api/actions/mark-sent route + 2 tests |

## Deviations from Plan

None - plan executed exactly as written.

## AGENTS.md Compliance

`apply/route.ts` calls `openInBrowse(url)` which maps to `gstack browse goto <url>` only. No `submit`, `fill`, `click`, or other subcommands are called. The user submits the application manually in the opened browser window.

## Known Stubs

None - both routes implement full behavior with real module dependencies (mocked only in tests).

## Threat Flags

No new threat surface beyond what was mitigated in the plan's threat model:
- T-03-07 (command injection): mitigated by `openInBrowse` → `validateUrl` (protocol allowlist + metachar sweep + array-form spawn)
- T-03-08 (path traversal via id): mitigated — id only used for row equality match, never in filesystem path
- T-03-09 (MD corruption via crafted status): mitigated — `z.enum` constrains to 6 safe string literals
- T-03-10 (lock starvation): mitigated — proper-lockfile retries + 423 response
- T-03-11, T-03-12, T-03-13: accepted per localhost-only stance

## Self-Check: PASSED

All 4 files exist on disk. Both task commits verified in git log. 34/34 tests passing.
