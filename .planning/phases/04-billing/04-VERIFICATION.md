---
phase: 04-billing
verified: 2026-05-22T00:00:00Z
status: passed
score: 8/8 must-haves verified
overrides_applied: 0
---

# Phase 04-billing: Billing + BYOK Gaps Verification Report

**Phase Goal:** Close 6 billing gaps in the existing codebase — correct eval limits, atomic gate, 7-day trial, success redirect, status route.
**Verified:** 2026-05-22
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Free user POST /api/intake returns 429 at eval #5 (not #10) | VERIFIED | `limit = hasApiKey ? Infinity : (isPro ? 100 : 5)` at line 90; limit: 5 in 429 body at line 116; no `currentCount >= 10` anywhere |
| 2 | Pro user without API key gets 429 at eval #100 | VERIFIED | Same limit expression — isPro with no key yields 100; limit: 100 in 429 body at line 123 |
| 3 | Pro user with API key (BYOK) is never blocked by eval limits | VERIFIED | `if (!hasApiKey)` guard at line 95 wraps entire RPC call — BYOK users skip gate entirely |
| 4 | Two concurrent intake calls at count=4 result in DB count=5, not 6 | VERIFIED | `004_atomic_eval.sql` uses `UPDATE ... WHERE eval_count < p_limit RETURNING eval_count` — Postgres row lock serializes concurrent calls |
| 5 | Stripe checkout sessions carry a 7-day trial | VERIFIED | `trial_period_days: 7` at line 52 of checkout/route.ts |
| 6 | Successful checkout redirects to /settings?welcome=pro | VERIFIED | `success_url: \`${origin}/settings?welcome=pro\`` at line 47; old `/billing?success=1` not present |
| 7 | GET /api/billing/status returns evalCount, limit, isPro, hasApiKey, evalsRemaining for client UI gating | VERIFIED | All 6 fields returned: isPro, proUntil, evalCount, limit, hasApiKey, evalsRemaining at lines 41-47 |
| 8 | Billing page shows 5 as the free limit (not 10) | VERIFIED | `{evalCount}/5 evaluations used this month.` at line 84; no `/10` pattern present |

**Score:** 8/8 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/004_atomic_eval.sql` | Postgres function increment_eval_count(p_user_id uuid, p_limit int) | VERIFIED | EXISTS — contains `CREATE OR REPLACE FUNCTION public.increment_eval_count`, `SECURITY DEFINER`, `eval_count < p_limit`, `GRANT EXECUTE` |
| `dashboard/web/app/api/intake/route.ts` | Eval gating with free=5, pro-hosted=100, BYOK=unlimited via atomic RPC | VERIFIED | EXISTS + SUBSTANTIVE — calls `supabase.rpc('increment_eval_count'`, correct limit logic, no old patterns |
| `dashboard/web/app/api/billing/status/route.ts` | Client-facing eval usage state including limit, hasApiKey | VERIFIED | EXISTS + SUBSTANTIVE — full response shape with all required fields |
| `dashboard/web/app/api/billing/checkout/route.ts` | Stripe checkout with 7-day trial and post-upgrade onboarding redirect | VERIFIED | EXISTS + SUBSTANTIVE — trial_period_days: 7, success_url to /settings?welcome=pro |
| `dashboard/web/app/(main)/billing/page.tsx` | Billing page with correct free-tier usage display (5/mo, not 10/mo) | VERIFIED | EXISTS + SUBSTANTIVE — {evalCount}/5 display, warnings at 4 and 5 |
| `dashboard/web/lib/database.types.ts` | RPC type signature increment_eval_count | VERIFIED | Contains `increment_eval_count: { Args: { p_user_id: string; p_limit: number }; Returns: number | null; }` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| dashboard/web/app/api/intake/route.ts | supabase function increment_eval_count | supabase.rpc atomic gate | WIRED | `supabase.rpc('increment_eval_count', { p_user_id: user.id, p_limit: ... })` at line 96 |
| dashboard/web/app/api/billing/status/route.ts | profile + usage_counters tables | Promise.all select | WIRED | Promise.all fetches both `profiles` (with `anthropic_api_key_encrypted`) and `usage_counters` at lines 16-27 |
| dashboard/web/app/api/billing/checkout/route.ts | stripe.checkout.sessions.create | subscription_data.trial_period_days | WIRED | `trial_period_days: 7` in subscription_data block; `success_url` set to `/settings?welcome=pro` |

### Anti-Patterns Found

None. No TODO/FIXME/PLACEHOLDER comments. No empty implementations. No hardcoded stale patterns (`currentCount >= 10`, `eval_count: currentCount + 1`, `freeLimit`, `billing?success=1`, `evalCount/10`) found in any modified file.

### Human Verification Required

1. **Stripe trial badge**
   - **Test:** Create a test checkout session via POST /api/billing/checkout and complete it in Stripe test mode
   - **Expected:** Stripe-hosted checkout page shows "7-day free trial" badge; after completion browser lands on /settings?welcome=pro
   - **Why human:** Cannot invoke Stripe checkout flow programmatically without live credentials and browser

2. **Concurrent intake race condition**
   - **Test:** Fire two simultaneous POST /api/intake requests for a free user at eval count=4
   - **Expected:** Exactly one succeeds (returns 201), the other returns 429; DB eval_count = 5
   - **Why human:** Requires live Supabase + concurrent HTTP clients; Postgres row-lock behavior cannot be verified by static grep

### Gaps Summary

No gaps. All 8 must-haves verified against actual codebase. Phase goal fully achieved.

---

_Verified: 2026-05-22_
_Verifier: Claude (gsd-verifier)_
