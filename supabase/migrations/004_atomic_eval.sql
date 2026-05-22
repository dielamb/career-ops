-- Migration 004: Atomic eval counter increment
-- Eliminates TOCTOU race in POST /api/intake by combining
-- "check current count" + "increment" into a single statement.
-- Returns the new eval_count if increment was allowed, NULL otherwise.

CREATE OR REPLACE FUNCTION public.increment_eval_count(
  p_user_id uuid,
  p_limit   int
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_month_start date := date_trunc('month', now())::date;
  v_new_count   int;
BEGIN
  -- Upsert with month rollover. If the row's month_start is stale,
  -- reset eval_count to 0 BEFORE the conditional increment below.
  INSERT INTO public.usage_counters (user_id, month_start, eval_count)
  VALUES (p_user_id, v_month_start, 0)
  ON CONFLICT (user_id) DO UPDATE
    SET eval_count = CASE
          WHEN public.usage_counters.month_start = v_month_start
            THEN public.usage_counters.eval_count
          ELSE 0
        END,
        month_start = v_month_start;

  -- Atomic conditional increment.
  UPDATE public.usage_counters
     SET eval_count = eval_count + 1,
         updated_at = now()
   WHERE user_id = p_user_id
     AND eval_count < p_limit
  RETURNING eval_count INTO v_new_count;

  -- v_new_count is NULL if the row existed but eval_count >= p_limit.
  RETURN v_new_count;
END;
$$;

-- Allow the authenticated role (and service_role) to call this RPC.
GRANT EXECUTE ON FUNCTION public.increment_eval_count(uuid, int) TO authenticated, service_role;
