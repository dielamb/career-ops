---
phase: 02-data-layer
plan: 03
subsystem: data-layer
tags: [spawn, child-process, proper-lockfile, security, vitest, url-validation, file-locking]

requires:
  - phase: 02-data-layer
    plan: 01
    provides: "dashboard/web/lib/schemas.ts + proper-lockfile installed"

provides:
  - "dashboard/web/lib/spawn-mjs.ts: validateUrl, openInBrowse, spawnMjs + InvalidUrlError"
  - "dashboard/web/lib/git-commit.ts: lockedWrite + LockedError"
  - "9 vitest tests covering URL rejection, spawn failure, lock contention, stale recovery, timeout"

affects: [03-api-routes]

tech-stack:
  added:
    - "proper-lockfile@4.1.2 (already installed by 02-01; used in git-commit.ts)"
    - "node:child_process spawn array-form pattern (established as project standard)"
  patterns:
    - "Array-form spawn: spawn(cmd, [args], { shell: false }) — no shell:true, no exec()"
    - "URL validation: new URL() parse + protocol allowlist + FORBIDDEN_CHARS defense-in-depth"
    - "Lock pattern: lockfile.lock() → try { fs.writeFile() } finally { release() }"
    - "ELOCKED catch → LockedError rethrow; other errors propagate as-is"

key-files:
  created:
    - "dashboard/web/lib/spawn-mjs.ts"
    - "dashboard/web/lib/git-commit.ts"
    - "dashboard/web/lib/__tests__/spawn-mjs.test.ts"
    - "dashboard/web/lib/__tests__/git-commit.test.ts"
  modified: []

key-decisions:
  - "Test 5 (spawn failure) uses EventEmitter.emit() on the returned ChildProcess to simulate error propagation, rather than vi.spyOn(spawn) — node:child_process spawn is non-configurable in vitest's jsdom env; real-spawn-then-synthetic-emit proves helper does not suppress error events"
  - "lockedWrite pre-creates file if missing (fs.access + fallback writeFile) — proper-lockfile v4 requires the target path to be accessible before locking"
  - "Stale timeout set to 10000ms matching plan spec; retry minTimeout 200ms (not 100ms from interfaces block) — plan body specifies 200ms"

metrics:
  duration: ~12min
  completed: 2026-05-20T16:54:31Z
  tasks: 3/3
  files_modified: 4
---

# Phase 2 Plan 03: spawn-mjs + git-commit Helpers Summary

**Array-form spawn wrapper (validateUrl/openInBrowse/spawnMjs) with URL protocol allowlist and shell-metachar defense-in-depth; proper-lockfile-guarded lockedWrite with stale recovery and LockedError on retry exhaustion; 9 vitest tests all green.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-05-20T16:44:00Z (estimated)
- **Completed:** 2026-05-20T16:54:31Z
- **Tasks:** 3/3
- **Files created:** 4

## Accomplishments

- `dashboard/web/lib/spawn-mjs.ts` — 66 lines implementing three exports:
  - `validateUrl(url)`: `new URL()` parse → protocol allowlist (`http:`/`https:`) → FORBIDDEN_CHARS sweep (7 metacharacters: backtick, `$(`, `;`, `&`, `|`, `>`, `<`)
  - `openInBrowse(url)`: calls `validateUrl`, then `spawn(BROWSE_BIN, ['goto', url], { shell: false })`
  - `spawnMjs(scriptPath, args)`: `statSync` check before spawn; `spawn('node', [scriptPath, ...args], { shell: false })`
- `dashboard/web/lib/git-commit.ts` — 58 lines:
  - `LockedError` custom class (name set in constructor)
  - `lockedWrite`: pre-creates file if missing; `lockfile.lock(filePath, { stale: 10000, retries: { retries: 3, factor: 2, minTimeout: 200, maxTimeout: 2000 } })`; write in try/finally release
  - ELOCKED → LockedError; all other errors propagate
- 5 spawn-mjs tests: valid URL spawn, non-http rejection, shell metachar rejection, ENOENT pre-spawn throw, error-event propagation
- 4 git-commit tests: happy write, contention retry (150ms window), stale-lock recovery (15s backdated .lock dir), acquisition timeout (LockedError thrown)
- Full vitest sweep: **24 passed** (1 smoke + 14 parsers from 02-02 + 9 from this plan)
- Santifer `update-system.mjs check` exits 0; zero diff in system-layer files

## Array-Form Spawn Signatures

```typescript
// openInBrowse — gstack browse binary, array form, explicit shell:false
spawn(BROWSE_BIN, ['goto', url], { stdio: 'ignore', detached: false, shell: false });

// spawnMjs — node interpreter, array form, explicit shell:false
spawn('node', [scriptPath, ...args], { stdio: 'inherit', shell: false });
```

## Lock Acquisition Config

```typescript
lockfile.lock(filePath, {
  stale: 10000,               // locks older than 10s are stale and auto-released
  retries: {
    retries: 3,               // 3 retry attempts after first failure
    factor: 2,                // exponential factor
    minTimeout: 200,          // first retry wait: 200ms
    maxTimeout: 2000,         // cap per retry: 2000ms
  },
});
// Worst-case total wait: ~200 + 400 + 800 = 1400ms before LockedError
```

## Test Results

| File | Tests | Result |
|------|-------|--------|
| `lib/__tests__/spawn-mjs.test.ts` | 5 | PASS |
| `lib/__tests__/git-commit.test.ts` | 4 | PASS |
| **Total (this plan)** | **9** | **PASS** |
| Full sweep (all plans) | 24 | PASS |

## Task Commits

| Task | Description | Commit |
|------|-------------|--------|
| 1 | spawn-mjs.ts + 5 tests | `0abe7b5` |
| 2 | git-commit.ts + 4 tests | `25b3953` |
| 3 | Verification sweep (no files changed) | — |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Test 5 spy approach: `vi.spyOn(node:child_process, 'spawn')` fails in vitest jsdom**
- **Found during:** Task 1 (test run)
- **Issue:** `Cannot redefine property: spawn` — node:child_process is a built-in with non-configurable `spawn` property in vitest's jsdom environment
- **Fix:** Replaced vi.spyOn approach with real-spawn + synthetic EventEmitter.emit() on the returned ChildProcess. Strategy proves helper does not suppress error events (the core security invariant) without requiring module interception
- **Files modified:** `dashboard/web/lib/__tests__/spawn-mjs.test.ts`
- **Commit:** `0abe7b5`

## Note for Phase 3 API Routes

`git-commit.ts` is **fs-write-only for v1**. The export name `lockedWrite` is intentionally scoped to filesystem writes — no actual `git commit` CLI call is made. Actual git-commit operations are deferred to v2 per design doc. Phase 3 API routes (`POST /api/actions/mark-sent`) should import `lockedWrite` from `@/lib/git-commit` for all `data/applications.md` mutations.

## Santifer Integrity

- `update-system.mjs check` exits 0 (status: update-available is informational, not a failure)
- Zero diff in: `update-system.mjs`, `templates/`, `modes/`, `AGENTS.md`
- `test-all.mjs --dashboard` pre-existing failures (CLAUDE.md section checks) are unrelated to this plan — they existed before Phase 2 began

## Known Stubs

None — both modules are fully implemented with no placeholder values, hardcoded empty returns, or TODO markers.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: command-injection-surface | `dashboard/web/lib/spawn-mjs.ts` | New spawn surface for external URL input. Mitigated by: (1) protocol allowlist, (2) FORBIDDEN_CHARS metachar rejection, (3) array-form spawn with explicit shell:false — three independent layers |

## Self-Check: PASSED

- `dashboard/web/lib/spawn-mjs.ts` — FOUND
- `dashboard/web/lib/git-commit.ts` — FOUND
- `dashboard/web/lib/__tests__/spawn-mjs.test.ts` — FOUND
- `dashboard/web/lib/__tests__/git-commit.test.ts` — FOUND
- Commit `0abe7b5` — FOUND
- Commit `25b3953` — FOUND
- 9 vitest tests GREEN — VERIFIED
- 24 total tests GREEN — VERIFIED
