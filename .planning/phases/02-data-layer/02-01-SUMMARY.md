---
phase: 02-data-layer
plan: 01
subsystem: data-layer
tags: [zod, schemas, typescript, dependencies, gray-matter, papaparse, remark]

requires:
  - phase: 01-foundation
    provides: Next.js 15 + React 19 + TypeScript strict + Vitest + Playwright baseline in dashboard/web/

provides:
  - "dashboard/web/lib/schemas.ts: Zod schemas + inferred TS types for Application, PipelineEntry, Report, Listing, ParseError"
  - "dashboard/web/package.json: 8 Phase 2 deps declared and installed"

affects: [02-02-parsers, 02-03-locks, 03-api-routes, 04-components, 05-pages]

tech-stack:
  added:
    - "zod@4.4.3 (runtime schema validation + type inference)"
    - "gray-matter@4.0.3 (frontmatter parser for .md files)"
    - "proper-lockfile@4.1.2 (file locking for MD writes)"
    - "remark@15.0.1 (markdown AST processor)"
    - "remark-parse@11.0.0 (remark MD parser plugin)"
    - "papaparse@5.5.3 (CSV/TSV parser)"
    - "@types/proper-lockfile@4.1.4 (types)"
    - "@types/papaparse@5.5.2 (types)"
  patterns:
    - "Single source of truth for runtime+type contract: lib/schemas.ts exported schemas + z.infer<> types"
    - "ParseError interface (not Zod schema) for per-row parser error boundaries"
    - "Nullable fields on optional report fields (score, reportPath, url, legitimacy, blocks rows)"

key-files:
  created:
    - "dashboard/web/lib/schemas.ts"
  modified:
    - "dashboard/web/package.json"
    - "dashboard/web/package-lock.json"

key-decisions:
  - "Used latest npm-resolved versions (no manual pinning) — lockfile pins for reproducibility"
  - "Block G (Posting Legitimacy) hoisted to top-level legitimacy field in ReportSchema, not inside blocks"
  - "ParseError is a TypeScript interface, not a Zod schema — parsers return { data: T[]; errors: ParseError[] }"
  - "Blocks A-F are each nullable to handle partial/malformed report files"

patterns-established:
  - "Schema pattern: export const {Name}Schema = z.object({...}); export type {Name} = z.infer<typeof {Name}Schema>"
  - "Import pattern for downstream: import { ApplicationSchema, type Application, type ParseError } from '@/lib/schemas'"

requirements-completed: [DAT-07]

duration: 2min
completed: 2026-05-20
---

# Phase 2 Plan 01: Install Deps + Schemas Summary

**Zod schemas (Application, PipelineEntry, Report, Listing) + ParseError type defined as single contract in dashboard/web/lib/schemas.ts; 8 Phase 2 deps installed (zod, gray-matter, proper-lockfile, remark, remark-parse, papaparse + types).**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-05-20T16:44:56Z
- **Completed:** 2026-05-20T16:47:05Z
- **Tasks:** 2/2
- **Files modified:** 3

## Accomplishments

- 8 packages added to dashboard/web/package.json and installed (npm exits 0, no peer-dep errors)
- dashboard/web/lib/schemas.ts written with 4 Zod schemas, 4 inferred types, 1 ParseError interface
- All 8 canonical application statuses encoded as Zod enum values (Evaluated, Applied, Responded, Interview, Offer, Rejected, Discarded, SKIP)
- All 4 pipeline checkbox states encoded (evaluated, skipped, error, pending)
- tsc --noEmit --skipLibCheck accepts schemas.ts standalone
- santifer update-system.mjs check exits 0; zero diff in system-layer files

## Installed Package Versions

| Package | Version |
|---------|---------|
| zod | 4.4.3 |
| gray-matter | 4.0.3 |
| proper-lockfile | 4.1.2 |
| remark | 15.0.1 |
| remark-parse | 11.0.0 |
| papaparse | 5.5.3 |
| @types/proper-lockfile | 4.1.4 |
| @types/papaparse | 5.5.2 |

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Phase 2 dependencies** - `78192e6` (feat)
2. **Task 2: Write lib/schemas.ts** - `3eb821e` (feat)

## Files Created/Modified

- `dashboard/web/lib/schemas.ts` - Zod schemas + inferred TS types for Application, PipelineEntry, Report, Listing; ParseError interface
- `dashboard/web/package.json` - 6 runtime + 2 dev deps added
- `dashboard/web/package-lock.json` - Regenerated lockfile (force-staged per Phase 1 precedent)

## Decisions Made

1. Used npm latest resolution for all deps — no manual version pinning. Lockfile handles reproducibility.
2. Block G (Posting Legitimacy) is hoisted to a top-level `legitimacy` field in ReportSchema rather than being inside `blocks`. This matches the actual report file format where legitimacy is in the header, not the blocks table.
3. ParseError is a plain TypeScript `interface`, not a Zod schema. Parsers emit `{ data: T[]; errors: ParseError[] }` — no need for runtime validation of error objects.
4. Audit warnings (8 moderate) are pre-existing in transitive deps from Phase 1 (Next.js 15 dev stack). Not introduced by Phase 2 deps. Documented here, not fixed (out-of-scope per deviation rules).

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - lib/schemas.ts is pure schema definitions with no data wiring or stubs.

## Threat Flags

None - this plan adds no network endpoints, auth paths, file access patterns, or schema changes at trust boundaries. Zod schemas are validation definitions only.

## Self-Check: PASSED

- `dashboard/web/lib/schemas.ts` — FOUND
- `dashboard/web/package.json` contains "zod" — FOUND
- Commit 78192e6 — FOUND
- Commit 3eb821e — FOUND
