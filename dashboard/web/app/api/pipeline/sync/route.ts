// POST /api/pipeline/sync
// Reads data/pipeline.md and upserts pending entries to Supabase pipeline table.
// Called after scan.mjs completes so new offers appear in the dashboard.

import { createServerSupabase } from '@/lib/supabase-server';
import { parsePipeline } from '@/lib/parse-pipeline';
import { pipelinePath } from '@/lib/api-paths';
import { jsonOk, jsonError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function POST() {
  const supabase = await createServerSupabase();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return jsonError(401, 'Unauthorized');

  let mdPath: string;
  try {
    mdPath = pipelinePath();
  } catch {
    return jsonError(503, 'pipeline.md path not found');
  }

  const { data: entries } = await parsePipeline(mdPath);
  if (!entries.length) return jsonOk({ synced: 0 });

  // Fetch existing URLs already in Supabase to avoid duplicates
  const { data: existing } = await supabase
    .from('pipeline')
    .select('url')
    .eq('user_id', user.id);

  const existingUrls = new Set((existing ?? []).map(r => r.url));

  const toInsert = entries
    .filter(e => e.url && !existingUrls.has(e.url))
    .map(e => ({
      user_id: user.id,
      url: e.url,
      company: e.company ?? null,
      title: e.title ?? null,
      score: e.score ?? null,
      status: e.state === 'evaluated' ? 'evaluated'
            : e.state === 'skipped'   ? 'skipped'
            : e.state === 'error'     ? 'error'
            :                           'pending',
      notes: e.note ?? null,
      eval_date: e.evalDate ?? null,
    }));

  if (!toInsert.length) return jsonOk({ synced: 0 });

  const { error } = await supabase.from('pipeline').insert(toInsert);
  if (error) return jsonError(500, error.message);

  return jsonOk({ synced: toInsert.length });
}
