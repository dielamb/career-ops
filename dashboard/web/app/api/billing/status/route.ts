// GET /api/billing/status
// Returns current plan + eval usage + BYOK status for the authenticated user.
// Client uses this to render usage meters, "1 evaluation left" toasts, and the
// upgrade modal when evalCount >= limit.

import { createServerSupabase } from '@/lib/supabase-server';
import { jsonError, jsonOk } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return jsonError(401, 'Unauthorized');

  const [{ data: profile }, { data: usage }] = await Promise.all([
    supabase
      .from('profiles')
      .select('is_pro, pro_until, anthropic_api_key_encrypted')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('usage_counters')
      .select('eval_count, month_start')
      .eq('user_id', user.id)
      .single(),
  ]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const evalCount = usage?.month_start === monthStart ? (usage.eval_count ?? 0) : 0;

  const isPro = profile?.is_pro ?? false;
  const hasApiKey = !!profile?.anthropic_api_key_encrypted?.trim();

  // BYOK = unlimited (null). Pro hosted = 100. Free = 5.
  const limit: number | null = hasApiKey ? null : (isPro ? 100 : 5);
  const evalsRemaining: number | null = limit === null ? null : Math.max(0, limit - evalCount);

  // isAdmin gates UI affordances that still depend on the local filesystem
  // (scan, reports, contact lookup, cover letter). Same env var that the
  // middleware uses so they can't drift.
  const adminEmails = (process.env.ADMIN_EMAILS ?? 'maciejkamichal@gmail.com')
    .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  const isAdmin = !!user.email && adminEmails.includes(user.email.toLowerCase());

  return jsonOk({
    isPro,
    proUntil: profile?.pro_until ?? null,
    evalCount,
    limit,
    hasApiKey,
    evalsRemaining,
    isAdmin,
  });
}
