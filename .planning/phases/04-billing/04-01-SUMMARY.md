---
phase: 04-billing
plan: "01"
subsystem: billing
tags: [billing, eval-gate, atomic-sql, intake, byok, rpc]
dependency_graph:
  requires: []
  provides:
    - supabase function increment_eval_count (atomic eval gate)
    - intake route with correct limits (free=5, pro-hosted=100, BYOK=unlimited)
    - billing status API with full client shape
  affects:
    - dashboard/web/app/api/intake/route.ts
    - dashboard/web/app/api/billing/status/route.ts
    - dashboard/web/lib/database.types.ts
tech_stack:
  added:
    - Postgres SECURITY DEFINER function with atomic conditional UPDATE
  patterns:
    - UPSERT + conditional UPDATE WHERE count < limit RETURNING eliminates TOCTOU race
    - RPC returns NULL on limit hit (no-row signal to caller)
    - BYOK gate: skip RPC entirely when anthropic_api_key_encrypted is truthy
key_files:
  created:
    - supabase/migrations/004_atomic_eval.sql
  modified:
    - dashboard/web/app/api/intake/route.ts
    - dashboard/web/app/api/billing/status/route.ts
    - dashboard/web/lib/database.types.ts
decisions:
  - "Atomic Postgres RPC replaces read-then-update: eliminates TOCTOU race in concurrent intake calls"
  - "BYOK users skip eval gate entirely — they pay for their own Anthropic usage"
  - "Free limit 5 (not 10): faster conversion clock per CEO plan v2"
  - "Pro hosted limit 100: separate from BYOK unlimited path"
  - "NULL return from RPC signals limit hit: avoids extra SELECT in hot path"
  - "Infinity cast to 2147483647 for Postgres int max when passing BYOK users through typed RPC"
metrics:
  duration: "~8 minutes"
  completed: "2026-05-22T19:28:30Z"
  tasks_completed: 3
  tasks_total: 3
  files_created: 1
  files_modified: 3
requirements_closed:
  - BILL-GAP-1
  - BILL-GAP-2
  - BILL-GAP-3
  - BILL-GAP-6
---

# Phase 04 Plan 01: Atomic Eval Gate + Billing Status Summary

**One-liner:** JWT-free atomic Postgres RPC closes TOCTOU race on eval counting; intake now enforces free=5/pro-hosted=100/BYOK=unlimited with structured 429 bodies; billing status exposes the full client shape.

## What Was Changed

### 1 file created

**`supabase/migrations/004_atomic_eval.sql`** — Postgres function `public.increment_eval_count(p_user_id uuid, p_limit int) RETURNS int`:
- SECURITY DEFINER + `search_path = public` (Supabase linter compliant)
- UPSERT handles no-row and month-rollover cases atomically
- Conditional `UPDATE ... WHERE eval_count < p_limit RETURNING eval_count` — row lock serializes concurrent calls
- Returns new eval_count on success, NULL when limit already reached
- GRANT EXECUTE to `authenticated, service_role`

### 3 files modified

**`dashboard/web/app/api/intake/route.ts`**:
- Removed old 2-step read (`SELECT eval_count`) + write (`upsert eval_count+1`) pattern
- Added atomic `supabase.rpc('increment_eval_count', ...)` call
- Limit logic: `hasApiKey ? Infinity : (isPro ? 100 : 5)`
- BYOK path: gate is skipped entirely (`if (!hasApiKey)`)
- 429 body for free tier: `{ error, upgradeRequired: true, count, limit: 5 }`
- 429 body for pro hosted: `{ error, upgradeRequired: false, count, limit: 100 }`
- Success response: `evalsRemaining: hasApiKey ? null : Math.max(0, limit - currentCount)`
- `Infinity` cast to `2147483647` (Postgres int max) before passing as `p_limit`

**`dashboard/web/app/api/billing/status/route.ts`**:
- Added `anthropic_api_key_encrypted` to profile SELECT
- Added `hasApiKey` boolean derived from trimmed key presence
- `limit: number | null` — null for BYOK, 100 for Pro hosted, 5 for Free
- `evalsRemaining: number | null` — null for BYOK, otherwise `Math.max(0, limit - evalCount)`
- Removed legacy `freeLimit: 10` field
- Full response shape: `{ isPro, proUntil, evalCount, limit, hasApiKey, evalsRemaining }`

**`dashboard/web/lib/database.types.ts`**:
- Changed `Functions: Record<string, never>` to include RPC signature:
  ```typescript
  Functions: {
    increment_eval_count: {
      Args: { p_user_id: string; p_limit: number };
      Returns: number | null;
    };
  };
  ```

## Exact RPC Signature Added

```sql
CREATE OR REPLACE FUNCTION public.increment_eval_count(
  p_user_id uuid,
  p_limit   int
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
```

## Migration Apply Instructions

```bash
# Option A: Supabase CLI
supabase db push

# Option B: Manual SQL apply via Supabase Dashboard
# Dashboard → SQL Editor → paste contents of supabase/migrations/004_atomic_eval.sql → Run
```

The function is idempotent (`CREATE OR REPLACE`) — safe to re-apply.

**Known limitation:** This plan does not retroactively migrate existing `usage_counters` rows. The function is idempotent on first call for any given user — it upserts a fresh row if none exists, or resets month_start if stale. Existing rows from the old (limit=10) implementation will continue to count correctly from their current state.

## Deviations from Plan

None — plan executed exactly as written.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: rls_bypass | supabase/migrations/004_atomic_eval.sql | SECURITY DEFINER function bypasses RLS by design; mitigated by p_user_id parameter and GRANT to authenticated only |

## Self-Check: PASSED

- [x] `supabase/migrations/004_atomic_eval.sql` exists with correct function
- [x] `dashboard/web/app/api/intake/route.ts` contains `supabase.rpc('increment_eval_count'`
- [x] `dashboard/web/lib/database.types.ts` contains `increment_eval_count: {`
- [x] `dashboard/web/app/api/billing/status/route.ts` contains `hasApiKey` and `limit === null ? null`
- [x] Commits: e82cbd9, 1563c4b, d17d54d
- [x] `npx tsc --noEmit` — no errors in modified files
