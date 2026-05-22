---
phase: 02-data-layer
plan: 02
subsystem: data-layer
tags: [parsers, zod, gray-matter, vitest, typescript, tdd]

requires:
  - phase: 02-data-layer
    plan: 01
    provides: "dashboard/web/lib/schemas.ts: ApplicationSchema, PipelineEntrySchema, ReportSchema, ParseError"

provides:
  - "dashboard/web/lib/parse-applications.ts: parseApplications(path)"
  - "dashboard/web/lib/parse-pipeline.ts: parsePipeline(path)"
  - "dashboard/web/lib/parse-reports.ts: parseReports(reportsDir, outputDir?)"

affects: [03-api-routes, 04-components, 05-pages]

tech-stack:
  added: []
  patterns:
    - "Per-row try/catch error boundary: bad row to errors[], rest parsed, no throws"
    - "Gray-matter used as front-matter strip pass for all report files"
    - "PDF companion override: fs.access(outputDir/NNN.pdf) overrides header pdf flag"

key-files:
  created:
    - "dashboard/web/lib/parse-applications.ts"
    - "dashboard/web/lib/parse-pipeline.ts"
    - "dashboard/web/lib/parse-reports.ts"
    - "dashboard/web/lib/__tests__/parse-applications.test.ts"
    - "dashboard/web/lib/__tests__/parse-pipeline.test.ts"
    - "dashboard/web/lib/__tests__/parse-reports.test.ts"
    - "dashboard/web/lib/__tests__/fixtures/applications-happy.md"
    - "dashboard/web/lib/__tests__/fixtures/applications-malformed-row.md"
    - "dashboard/web/lib/__tests__/fixtures/applications-empty.md"
    - "dashboard/web/lib/__tests__/fixtures/pipeline-happy.md"
    - "dashboard/web/lib/__tests__/fixtures/pipeline-malformed-row.md"
    - "dashboard/web/lib/__tests__/fixtures/pipeline-empty.md"
    - "dashboard/web/lib/__tests__/fixtures/report-happy.md"
    - "dashboard/web/lib/__tests__/fixtures/report-missing-blocks.md"
  modified:
    - "dashboard/web/vitest.config.ts"

decisions:
  - "Blocks section extracted via regex covering both mid-document and end-of-file positions"
  - "Pipeline skipped-state rows use best-effort token extraction with remainder as note"
  - "PDF companion check uses zero-padded num (001.pdf) to match actual output/ naming"
  - "test-all.mjs --dashboard failures (39) are pre-existing — not introduced by this plan"

metrics:
  duration: "4min"
  completed: "2026-05-20T16:54:36Z"
  started: "2026-05-20T16:50:43Z"
  tasks: 4/4
  files_modified: 15
---

# Phase 2 Plan 02: MD Parsers Summary

**Three per-row-safe MD parsers (parse-applications, parse-pipeline, parse-reports) ship typed arrays to Phase 3 API routes; each returns { data, errors } tuple and never throws on malformed input; 14 vitest tests (5+5+4) all green.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-05-20T16:50:43Z
- **Completed:** 2026-05-20T16:54:36Z
- **Tasks:** 4/4
- **Files created:** 14 (3 parsers + 3 test files + 8 fixtures) + 1 config modified

## Accomplishments

- parseApplications parses table rows from data/applications.md — score stripped of /5, pdf emoji to bool, reportPath extracted via regex
- parsePipeline processes checkbox list lines (- [x|s|!| ]) with state mapping and URL-required guard
- parseReports reads directory of NNN-slug-YYYY-MM-DD.md files, extracts Blocks A-F via regex, PDF companion override via fs.access
- All 3 parsers: ENOENT returns { data: [], errors: [ParseError] } — no throw propagation
- Per-row try/catch in each parser — bad row collected in errors[], rest of rows parsed
- vitest.config.ts include glob extended to cover lib/__tests__/**
- 8 fixture MD files covering happy, malformed, and empty cases

## Test Results Per File

| File | Tests | Result |
|------|-------|--------|
| parse-applications.test.ts | 5 | 5 passed |
| parse-pipeline.test.ts | 5 | 5 passed |
| parse-reports.test.ts | 4 | 4 passed |
| **Total (this plan)** | **14** | **14 passed** |
| smoke.test.ts | 1 | 1 passed (no regression) |

Combined `npx vitest run` = 24 passed (14 from this plan + 10 from 02-03 merged in base).

## Task Commits

1. **Task 1: parse-applications.ts + 5 tests + fixtures** - `6093aa6`
2. **Task 2: parse-pipeline.ts + 5 tests + fixtures** - `7f8afe1`
3. **Task 3: parse-reports.ts + 4 tests + fixtures** - `9c26d6d`
4. **Task 4: Full sweep (verification only)** - confirmed 14/14 parser tests pass

## Decisions Made

1. Blocks section regex uses lookahead for next ## heading or end-of-file
2. Pipeline best-effort extraction for skipped/error/pending: company/title from first two tokens; rest joins as note
3. PDF companion zero-padding: String(num).padStart(3,'0') + '.pdf' to match output/001.pdf real naming
4. test-all.mjs --dashboard pre-existing failures confirmed identical to base commit

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all parsers read real file paths provided at runtime.

## Santifer Integrity

- No system-layer files (update-system.mjs, templates/, modes/, AGENTS.md) touched
- test-all.mjs --dashboard result identical to base commit (54/39/13 pre-existing state)

## Threat Flags

None — parsers are read-only file consumers with no network endpoints or write operations.

## Self-Check: PASSED

- dashboard/web/lib/parse-applications.ts — FOUND
- dashboard/web/lib/parse-pipeline.ts — FOUND
- dashboard/web/lib/parse-reports.ts — FOUND
- All 6 test files and 8 fixtures — FOUND
- Commits 6093aa6, 7f8afe1, 9c26d6d — FOUND
