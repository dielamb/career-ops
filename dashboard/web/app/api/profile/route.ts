// GET /api/profile — return current user's profile
// PATCH /api/profile — update cv_text, anthropic_api_key_encrypted, scoring_prefs

import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase-server';
import { jsonOk, jsonError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return jsonError(401, 'Unauthorized');

  const { data, error } = await supabase
    .from('profiles')
    .select('cv_text, anthropic_api_key_encrypted, scoring_prefs, created_at, updated_at')
    .eq('user_id', user.id)
    .single();

  if (error) return jsonError(500, error.message);
  const prefs = (data?.scoring_prefs ?? {}) as Record<string, unknown>;
  const titleFilter = (prefs.title_filter ?? {}) as { positive?: string[]; negative?: string[] };
  return jsonOk({
    cvText: data?.cv_text ?? '',
    hasApiKey: !!data?.anthropic_api_key_encrypted,
    updatedAt: data?.updated_at,
    titleFilter: {
      positive: titleFilter.positive ?? [],
      negative: titleFilter.negative ?? [],
    },
  });
}

const PatchBody = z.object({
  cvText: z.string().optional(),
  apiKey: z.string().optional(),
  titleFilter: z.object({
    positive: z.array(z.string()).max(100),
    negative: z.array(z.string()).max(100),
  }).optional(),
});

export async function PATCH(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return jsonError(401, 'Unauthorized');

  let raw: unknown;
  try { raw = await req.json(); } catch { return jsonError(400, 'Invalid JSON'); }

  const parsed = PatchBody.safeParse(raw);
  if (!parsed.success) return jsonError(400, 'Invalid body');

  const updates: Record<string, unknown> = {};
  if (parsed.data.cvText !== undefined) updates.cv_text = parsed.data.cvText;
  if (parsed.data.apiKey !== undefined) updates.anthropic_api_key_encrypted = parsed.data.apiKey;

  if (parsed.data.titleFilter !== undefined) {
    // Merge into existing scoring_prefs so we don't clobber sibling keys.
    const { data: current } = await supabase
      .from('profiles')
      .select('scoring_prefs')
      .eq('user_id', user.id)
      .single();
    const prev = (current?.scoring_prefs ?? {}) as Record<string, unknown>;
    updates.scoring_prefs = {
      ...prev,
      title_filter: {
        positive: parsed.data.titleFilter.positive.map((s) => s.trim()).filter(Boolean),
        negative: parsed.data.titleFilter.negative.map((s) => s.trim()).filter(Boolean),
      },
    };
  }

  if (Object.keys(updates).length === 0) return jsonError(400, 'Nothing to update');

  const { error } = await supabase
    .from('profiles')
    .upsert({ user_id: user.id, ...updates });

  if (error) return jsonError(500, error.message);
  return jsonOk({ ok: true });
}
