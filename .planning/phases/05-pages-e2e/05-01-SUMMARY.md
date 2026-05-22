---
phase: 05-pages-e2e
plan: "01"
subsystem: billing-unit-tests
tags: [testing, billing, stripe, supabase, vitest]
dependency_graph:
  requires: [04-billing-01, 04-billing-02]
  provides: [billing-webhook-coverage, billing-status-coverage, billing-checkout-coverage, intake-gate-coverage]
  affects: [test-suite]
tech_stack:
  added: []
  patterns: [vitest-module-mock, stripe-constructor-mock, supabase-from-chain-mock]
key_files:
  created:
    - dashboard/web/app/api/__tests__/billing-webhook.test.ts
    - dashboard/web/app/api/__tests__/billing-status.test.ts
    - dashboard/web/app/api/__tests__/billing-checkout.test.ts
    - dashboard/web/app/api/__tests__/billing-intake-gate.test.ts
    - dashboard/web/app/api/billing/webhook/route.ts
  modified: []
decisions:
  - "Symlinked node_modules from main project to worktree (stripe not in worktree package.json)"
  - "Copied webhook route from main project (was untracked, not in base commit 6120745)"
  - "Used vi.mock with factory at module level per existing test pattern"
metrics:
  duration: "12 minutes"
  completed: "2026-05-22"
  tasks_completed: 4
  files_created: 5
---

# Phase 05 Plan 01: Billing Unit Tests Summary

**One-liner:** 20 Vitest unit tests added across 4 billing-critical API routes — Stripe webhook signature + lifecycle, /status tier shapes, /checkout trial config, and intake atomic eval gate — all mock-based with no live network calls.

## What Was Built

4 test files created in `dashboard/web/app/api/__tests__/` covering the highest-risk billing surfaces:

| File | Tests | Coverage |
|------|-------|----------|
| `billing-webhook.test.ts` | 8 | Signature spoof prevention, subscription lifecycle, grace-period guard, missing-metadata skip |
| `billing-status.test.ts` | 4 | Auth gate, free/pro-hosted/BYOK tier shapes |
| `billing-checkout.test.ts` | 4 | Auth gate, already-Pro guard, missing-env guard, trial_period_days+success_url |
| `billing-intake-gate.test.ts` | 4 | Atomic RPC contract, 429 gate, BYOK skip, no-CV early return |

## Verification Results

```
PASS (30) FAIL (0)
```

All 30 tests pass (10 pre-existing + 20 new billing tests). Runtime under 3 seconds.

## Gaps Closed

- **Webhook signature spoof** (Test 1-2 in billing-webhook): constructEvent throws → 400, no DB write
- **Eval-gate race** (Test 1-2 in billing-intake-gate): Atomic RPC signature `{ p_user_id, p_limit: 5 }` locked in; null return triggers 429
- **Missing-env regression** (Test 3 in billing-checkout): STRIPE_PRO_PRICE_ID missing → 500 caught before Stripe SDK called
- **BYOK accidentally gated** (Test 3 in billing-intake-gate): `mockRpc.not.toHaveBeenCalled()` ensures BYOK users bypass the counter entirely

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] webhook/route.ts not present in worktree base commit**
- **Found during:** Task 1
- **Issue:** The worktree was based on commit 6120745 which predates the webhook route addition. The file existed only as an untracked file in the main project.
- **Fix:** Copied `dashboard/web/app/api/billing/webhook/route.ts` from main project to worktree and committed it together with the test file.
- **Files modified:** `dashboard/web/app/api/billing/webhook/route.ts` (added)
- **Commit:** 0ba1fb2

**2. [Rule 3 - Blocking] stripe package not in worktree node_modules**
- **Found during:** Task 1
- **Issue:** `package.json` in the base commit did not include `stripe` (it was added when billing was built but the worktree was at an older commit).
- **Fix:** Symlinked `node_modules` from the main project to the worktree. No package.json modification needed since stripe was already installed in the shared workspace.
- **Files modified:** none (symlink only)
- **Commit:** n/a

## Known Stubs

None. All test assertions cover real route behavior with no placeholder values.

## Known Limitations

- **Supabase Vault key-decryption NOT tested** — requires live Postgres connection. Accepted for v1.
- **trial_period_days=7 verified at API call layer only** — actual Stripe-side trial behavior requires manual verification via `stripe trigger checkout.session.completed` (out of scope).

## Self-Check

- [x] `dashboard/web/app/api/__tests__/billing-webhook.test.ts` exists
- [x] `dashboard/web/app/api/__tests__/billing-status.test.ts` exists
- [x] `dashboard/web/app/api/__tests__/billing-checkout.test.ts` exists
- [x] `dashboard/web/app/api/__tests__/billing-intake-gate.test.ts` exists
- [x] Commits 0ba1fb2, 44f8613, 38317ca, 0687a12 exist in git log
- [x] `npx vitest run app/api/__tests__/billing-*.test.ts` reports 20 passed

## Self-Check: PASSED
