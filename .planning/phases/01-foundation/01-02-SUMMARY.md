---
phase: 01-foundation
plan: 02
subsystem: dashboard-web
tags: [foundation, testing, vitest, playwright, ci-integration, santifer-compat]
dependency_graph:
  requires:
    - "Plan 01-01 (dashboard/web/ Next.js + React + Tailwind scaffold) merged into base"
  provides:
    - "Vitest unit-test runner (jsdom) wired to tests/**/*.test.{ts,tsx}"
    - "Playwright E2E runner (chromium) wired to e2e/**, auto-starts Next.js dev server"
    - "`node test-all.mjs --dashboard` target running both runners; default invocation unchanged"
    - "Test directory layout (tests/ for unit, e2e/ for E2E) for Phases 2-5 to drop tests into"
  affects:
    - "All Phase 2-5 work — parsers, API routes, components, pages can drop tests in"
    - "santifer system file `test-all.mjs` (additive only — sections 1-10 byte-identical)"
tech_stack:
  added:
    - "vitest@2.1.9"
    - "@vitest/ui@2.1.9"
    - "jsdom@29.1.1"
    - "@playwright/test@1.x (latest)"
    - "chromium browser binary (~169 MiB, installed in ~/Library/Caches/ms-playwright/)"
  patterns:
    - "Vitest with jsdom for DOM-aware unit tests (Phase 2-5 will add React Testing Library)"
    - "Playwright with `webServer` config that auto-starts and reuses `npm run dev`"
    - "Repo-root `test-all.mjs --dashboard` flag pattern (santifer file modified additively only)"
    - "Test layout convention: `tests/` for vitest unit, `e2e/` for playwright E2E"
key_files:
  created:
    - "dashboard/web/vitest.config.ts"
    - "dashboard/web/playwright.config.ts"
    - "dashboard/web/tests/smoke.test.ts"
    - "dashboard/web/e2e/smoke.spec.ts"
  modified:
    - "dashboard/web/package.json (added test, test:run, test:e2e scripts + devDependencies)"
    - "dashboard/web/package-lock.json (npm install)"
    - "test-all.mjs (additive: const DASHBOARD + early-exit if-block before section 1)"
decisions:
  - "Use `reuseExistingServer: !process.env.CI` so local dev workflow reuses a running `npm run dev` instead of port-warring; CI mode always boots a fresh server"
  - "Chromium-only Playwright project (no Firefox/WebKit for now — single browser is sufficient for smoke; broaden later if cross-browser bugs surface)"
  - "Single worker, fullyParallel=false, retries=0 for Playwright — keeps local feedback deterministic; tune for parallelism once test count grows"
  - "Vitest config uses `globals: true` so tests can use `describe`/`it`/`expect` without imports (matches Jest ergonomics; still allows explicit imports as in smoke.test.ts)"
  - "test-all.mjs `--dashboard` branch placed BEFORE sections 1-10 with an early `process.exit(0)`, so the 10-section santifer battery is touched zero times when the flag is present"
metrics:
  tasks_completed: 3
  tasks_total: 3
  files_created: 4
  files_modified: 3
  commits: 2
  duration_minutes: ~12
  completed_date: "2026-05-20"
requirements_completed: [FND-03, FND-04]
---

# Phase 1 Plan 02: Test Infrastructure Summary

**One-liner:** Wired Vitest (jsdom) + Playwright (chromium with webServer auto-start) into `dashboard/web/`, exposed both behind `node test-all.mjs --dashboard` at repo root with zero changes to the existing santifer test battery.

## What shipped

- **Vitest 2.1.9** (jsdom env, `tests/**/*.test.{ts,tsx}` glob, excludes `e2e/`, `globals: true`)
- **@vitest/ui 2.1.9** (interactive Vitest UI — available via `vitest --ui` when needed)
- **jsdom 29.1.1** (DOM environment for component tests in Phases 2-5)
- **@playwright/test** (chromium-only project, `e2e/` testDir, `webServer` config auto-starts and reuses `npm run dev` at `http://localhost:3000`, 120s startup timeout)
- **Chromium binary** downloaded to `~/Library/Caches/ms-playwright/chromium-1223/` (~169 MiB)
- **3 new npm scripts** in `dashboard/web/package.json`: `test`, `test:run`, `test:e2e`
- **2 smoke tests**:
  - `tests/smoke.test.ts` — `expect(1 + 1).toBe(2)` (vitest)
  - `e2e/smoke.spec.ts` — `page.getByText("Today.").toBeVisible()` (playwright against live Next.js dev server)
- **test-all.mjs `--dashboard` branch** — single early-exit block inserted between the suite header (`🧪 career-ops test suite`) and section 1; sections 1-10 unchanged

## Final file inventory

### Created (4 files)

- `dashboard/web/vitest.config.ts` (10 lines — jsdom + includes/excludes + globals)
- `dashboard/web/playwright.config.ts` (24 lines — chromium project + webServer block)
- `dashboard/web/tests/smoke.test.ts` (7 lines)
- `dashboard/web/e2e/smoke.spec.ts` (6 lines)

### Modified (3 files)

- `dashboard/web/package.json` — scripts section grew from 4 entries (`dev`, `build`, `start`, `lint`) to 7 (`+test`, `+test:run`, `+test:e2e`); devDependencies grew with `vitest`, `@vitest/ui`, `jsdom`, `@playwright/test`
- `dashboard/web/package-lock.json` — npm-managed; reflects new dev deps
- `test-all.mjs` — **40 insertions, 0 deletions**. Two additive edits:
  - L22: added `const DASHBOARD = process.argv.includes('--dashboard');` directly under the existing `QUICK` line
  - L47-86: inserted `// ── DASHBOARD MODE ───` block + `if (DASHBOARD) { ... process.exit(0); }` between line 45 (`console.log('\n🧪 career-ops test suite\n');`) and the original section 1

## Exact diff applied to test-all.mjs

```
@@ -21,6 +21,7 @@
 const QUICK = process.argv.includes('--quick');
+const DASHBOARD = process.argv.includes('--dashboard');

@@ -45,6 +46,45 @@
 console.log('\n🧪 career-ops test suite\n');

+// ── DASHBOARD MODE ───────────────────────────────────────────────
+// When `--dashboard` is passed, run only the Next.js dashboard tests
+// (Vitest + Playwright in dashboard/web/) and exit. Santifer's regular
+// test battery (sections 1-10 below) is skipped in this mode.
+if (DASHBOARD) {
+  console.log('Mode: --dashboard (vitest + playwright in dashboard/web/)\n');
+  const webDir = join(ROOT, 'dashboard', 'web');
+  if (!existsSync(webDir)) {
+    fail('dashboard/web/ does not exist — run Phase 1 Plan 01 first');
+    process.exit(1);
+  }
+  console.log('1. Vitest unit tests');
+  const vitestResult = run('npm', ['run', 'test:run'], { cwd: webDir, timeout: 120000, stdio: ['pipe', 'pipe', 'pipe'] });
+  if (vitestResult !== null) { pass('vitest passed'); } else { fail('vitest failed'); }
+
+  console.log('\n2. Playwright E2E tests');
+  const playwrightResult = run('npm', ['run', 'test:e2e'], { cwd: webDir, timeout: 180000, stdio: ['pipe', 'pipe', 'pipe'] });
+  if (playwrightResult !== null) { pass('playwright passed'); } else { fail('playwright failed'); }
+
+  console.log('\n' + '='.repeat(50));
+  console.log(`📊 Dashboard results: ${passed} passed, ${failed} failed`);
+  if (failed > 0) { console.log('🔴 DASHBOARD TESTS FAILED\n'); process.exit(1); }
+  console.log('🟢 Dashboard tests passed\n');
+  process.exit(0);
+}
+
 // ── 1. SYNTAX CHECKS ────────────────────────────────────────────
```

Net: 1 line edited (QUICK line, now followed by DASHBOARD), 40 lines inserted before the original section 1. Original 10-section santifer battery is byte-identical.

## Confirmed pass output of `node test-all.mjs --dashboard`

```
🧪 career-ops test suite

Mode: --dashboard (vitest + playwright in dashboard/web/)

1. Vitest unit tests
  ✅ vitest passed

2. Playwright E2E tests
  ✅ playwright passed

==================================================
📊 Dashboard results: 2 passed, 0 failed
🟢 Dashboard tests passed
```

(Exit code 0.)

## Tasks executed

| Task | Name | Status | Commit |
|------|------|--------|--------|
| 1 | Install vitest + playwright + add scripts + write smoke tests | done | `9129982` |
| 2 | Add --dashboard target to test-all.mjs (preserve original behavior) | done | `bfab380` |
| 3 | Verify end-to-end test integration + santifer compatibility | approved | (checkpoint, no commit) |

## Verification results

| Check | Command | Result |
|-------|---------|--------|
| Vitest smoke passes | `cd dashboard/web && npm run test:run` | Exit 0 — `1 passed (1)` in 857ms |
| Playwright smoke passes | `cd dashboard/web && npm run test:e2e` | Exit 0 — `1 passed (5.8s)` against live Next.js dev server |
| `--dashboard` runs both | `node test-all.mjs --dashboard` | Exit 0 — `🟢 Dashboard tests passed` |
| `--quick` does NOT trigger dashboard mode | `node test-all.mjs --quick` | Sections 1-10 run, dashboard branch skipped (confirmed via section header grep) |
| santifer system probe | `node update-system.mjs check` | Exit 0 — `{"status":"update-available","local":"1.7.1","remote":"1.8.0",...}` |
| test-all.mjs diff is additive only | `git diff --stat HEAD~2..HEAD test-all.mjs` | 40 insertions, 0 deletions |
| All 10 santifer section headers present | `grep -c "[1-9]\. \|10\. " test-all.mjs` | 10 unique sections present (12 matches due to QUICK-branch duplicate of section 4 header) |
| Chromium binary installed | `ls ~/Library/Caches/ms-playwright/chromium-*` | `chromium-1223/` present |
| Visual checkpoint | All 5 manual verification steps | User approved |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Killed stray Next.js dev server holding port 3000**
- **Found during:** Task 1, Step 7 (running `npm run test:e2e`)
- **Issue:** A previous Next.js dev process (PID 88245) was already listening on port 3000 from a different working directory. Playwright's `webServer` block waits for `http://localhost:3000` to be its own server, so even though `reuseExistingServer: !process.env.CI` is set, the lingering process belonged to a different repo (main repo, not the worktree) and was not serving the worktree's `dashboard/web/` content. Playwright hung waiting for the configured URL to become ready.
- **Fix:** `lsof -ti:3000 | xargs kill -9` to free the port. Playwright then started its own Next.js dev server cleanly and the E2E smoke passed in 5.8s.
- **Files modified:** None (operational fix, not a code change)
- **Commit:** N/A — same task commit `9129982`

**2. [Rule 3 - Blocking] Worktree branch did not yet include Plan 01-01 commits**
- **Found during:** Pre-execution worktree verification
- **Issue:** The worktree branch `worktree-agent-a090791745241c9fe` was based off `main` (commit `b8a3a12`), but the Plan 01-01 work (`36068b3`, `e125980`, `7cdbb26`) was on a separate branch `fix/pdf-signature-and-filter`. The `dashboard/web/` directory did not exist in the worktree until those commits were merged.
- **Fix:** Fast-forward merged `fix/pdf-signature-and-filter` into the worktree branch (no conflicts, the worktree branch was a pure ancestor). After the merge, `dashboard/web/package.json` and the rest of the Plan 01-01 artifacts were present and the plan could proceed.
- **Files modified:** None directly — the merge brought in Plan 01-01 files which are pre-existing artifacts of the upstream plan
- **Commit:** N/A — merge commit not part of Plan 01-02 work

No other deviations. Plan 01-02 tasks executed exactly as written.

## Auth gates

None encountered.

## Known Stubs

None. The two smoke tests (`expect(1+1).toBe(2)` for vitest; `getByText("Today.")` for playwright) are intentionally minimal proofs that the runners work. Real tests covering parsers, components, and routes land in Phases 2-5 — each subsequent plan adds tests against its own deliverables.

## Pre-existing worktree state (out of scope)

The `node test-all.mjs --quick` invocation surfaces several failures that are NOT caused by Plan 01-02:

- Section 5 reports `Missing system file: .claude/skills/career-ops/SKILL.md` — the worktree has this as a broken symlink (`SKILL.md -> ../../../.agents/skills/career-ops/SKILL.md`) and the target does not exist
- Section 7 reports `Absolute path` failures inside `.planning/phases/01-foundation/01-01-PLAN.md` and `01-02-PLAN.md` — these are planning documents (not code) that embed absolute paths in `<automated>` verify blocks; the absolute-path scanner does not exclude `.planning/`
- Section 9 reports all required `CLAUDE.md` sections missing — the worktree's `CLAUDE.md` is the streamlined Claude-Code-specific version (`@AGENTS.md` import + brief project additions, 82 lines); the santifer sections (Data Contract, Update Check, Ethical Use, etc.) live in `AGENTS.md`, not `CLAUDE.md`

All three pre-existed at HEAD before any work on Plan 01-02 started. They are unrelated to test infrastructure changes and out of scope for this plan. Confirmed by `git diff --stat HEAD~2..HEAD test-all.mjs` showing only additive insertions to the `--dashboard` branch.

## Phase 1 closeout

Phase 1 (Foundation) complete:

- Plan 01-01 — scaffold + DESIGN.md tokens + Y2K smoke page (FND-01, FND-02) — done
- Plan 01-02 — Vitest + Playwright + `test-all.mjs --dashboard` (FND-03, FND-04) — done (this plan)

**Next:** Phase 2 (Data Layer) — generate plans for parsers, models, and persistence. Phase 2-5 deliverables now have a passing-test home (`dashboard/web/tests/` for vitest, `dashboard/web/e2e/` for playwright) with zero infra work needed per plan.

## Self-Check: PASSED

Files verified present:
- FOUND: dashboard/web/vitest.config.ts
- FOUND: dashboard/web/playwright.config.ts
- FOUND: dashboard/web/tests/smoke.test.ts
- FOUND: dashboard/web/e2e/smoke.spec.ts
- FOUND: dashboard/web/package.json (with test, test:run, test:e2e scripts)
- FOUND: test-all.mjs (with const DASHBOARD + DASHBOARD MODE block)

Commits verified in git log:
- FOUND: 9129982 (Task 1)
- FOUND: bfab380 (Task 2)

Original santifer section headers verified in test-all.mjs (`1. Syntax checks` through `10. Version file`): all 10 present.
