---
phase: 04-billing
plan: 02
subsystem: billing
tags: [stripe, checkout, trial, billing-page, free-tier]
dependency_graph:
  requires: []
  provides: [stripe-trial, byok-onboarding-redirect, free-tier-5-limit-ui]
  affects: [billing-page, checkout-route, webhook]
tech_stack:
  added: []
  patterns: [stripe-subscription-data-trial, success-url-redirect]
key_files:
  created: []
  modified:
    - dashboard/web/app/api/billing/checkout/route.ts
    - dashboard/web/app/(main)/billing/page.tsx
decisions:
  - "success_url redirects to /settings?welcome=pro instead of /billing?success=1 — keeps BYOK onboarding flow intact"
  - "success banner at /billing?success=1 left in place per surgical-change rule (cancel flow still uses /billing?canceled=1)"
  - "$9/month Pro copy unchanged — pricing update is out of scope per ROADMAP"
metrics:
  duration: ~8min
  completed: 2026-05-22
  tasks_completed: 2
  files_modified: 2
---

# Phase 4 Plan 2: Billing Gaps 4+5 — Trial + Redirect Summary

One-liner: Stripe checkout gains 7-day trial via `subscription_data.trial_period_days: 7` and redirects successful upgrades to `/settings?welcome=pro`; billing page free-tier card corrected from 10-eval to 5-eval limit.

## What Changed

### Task 1 — `dashboard/web/app/api/billing/checkout/route.ts` (commit `6638e05`)

Two targeted changes to the `sessionParams` object:

1. `success_url` changed from `` `${origin}/billing?success=1` `` to `` `${origin}/settings?welcome=pro` ``
   — Directs newly upgraded users straight to the BYOK API-key onboarding page.

2. `subscription_data` expanded from `{ metadata: { supabase_user_id: user.id } }` to:
   ```typescript
   {
     metadata: { supabase_user_id: user.id },
     trial_period_days: 7,
   }
   ```
   — Activates a 7-day free trial on every new Pro subscription as per ROADMAP Phase 4 success criterion #2.

Unchanged: `cancel_url` (`/billing?canceled=1`), `metadata.supabase_user_id` (top-level, required by webhook), customer/customer_email branching, `getStripe()` factory, early-return on `is_pro`.

### Task 2 — `dashboard/web/app/(main)/billing/page.tsx` (commit `02b9156`)

Free-tier usage card updated:

| Before | After |
|--------|-------|
| `{evalCount}/10 evaluations used` | `{evalCount}/5 evaluations used` |
| Warning at `evalCount >= 8` | Warning at `evalCount === 4` ("Running low — 1 evaluation left…") |
| No blocking copy | Blocking copy at `evalCount >= 5` ("Limit reached — upgrade to keep evaluating.") |
| Bar denominator 10 | Bar denominator 5 |
| Magenta at `evalCount >= 8` | Magenta at `evalCount >= 4` |

No new Tailwind tokens introduced. Existing `bg-magenta`, `bg-cyber`, `bg-chrome`, `border-ink`, `bg-paper`, `text-ink-muted`, `font-mono`, `font-body` reused. Pro card unchanged.

## Verification

### Stripe trial verification
```bash
# After a test checkout: retrieve the session's subscription
stripe checkout sessions retrieve <session_id> --expand subscription
# Expect: subscription.trial_end is set (7 days from creation)
# Or: stripe subscriptions retrieve <sub_id> | jq .trial_period_days
```

### Redirect verification
After completing Stripe test checkout, confirm browser lands on `/settings?welcome=pro` (not `/billing?success=1`).

### Billing page verification
```bash
# Temporarily set evalCount to 4 in DB and visit /billing
# Expect: "4/5 evaluations used this month. Running low — 1 evaluation left. Upgrade for 100/mo or BYOK unlimited."
# Bar should be magenta at 80% fill
```

## Known Out-of-Scope Items

1. **Success banner at `/billing?success=1` is now dead code** — `success_url` redirects to `/settings?welcome=pro` so `?success=1` is never appended to `/billing`. The banner JSX remains per surgical-change rule (touching it would modify a section unrelated to the billing gap). The `?canceled=1` branch next to it is live. Cleanup is a separate task.

2. **$9/month Pro copy** — ROADMAP shows a future $12 pricing change. Out of scope; unchanged here.

3. **Pro user eval counter** — The "Unlimited evaluations." Pro card copy is a minor whitewash; 100/mo hosted cap is server-side only. Surfacing a Pro usage meter is future work.

## Deviations from Plan

None — plan executed exactly as written.

## Threat Flags

None — no new network endpoints, auth paths, or schema changes introduced. The `success_url` change affects only the redirect target after Stripe payment completion (Stripe-controlled flow, no new trust boundaries).

## Self-Check: PASSED

Files exist:
- `dashboard/web/app/api/billing/checkout/route.ts` — FOUND (6638e05)
- `dashboard/web/app/(main)/billing/page.tsx` — FOUND (02b9156)

Commits exist:
- `6638e05` — feat(04-billing-02): add 7-day trial and fix success_url
- `02b9156` — feat(04-billing-02): update billing page to 5-eval free-tier limit
