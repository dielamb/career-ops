// GET /api/pipeline/[id]
// Returns a single pipeline row + joined listing row for the authenticated user.
// Used by PipelineDetailModal when the row id is a Supabase uuid (i.e. a row
// that came from /api/intake, not from the legacy MD report files).

import { createServerSupabase } from '@/lib/supabase-server';
import { jsonError, jsonOk } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return jsonError(400, 'Invalid pipeline id');

  const supabase = await createServerSupabase();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return jsonError(401, 'Unauthorized');

  // RLS already restricts to user_id = auth.uid(), but pin it explicitly so
  // future RLS changes don't accidentally widen the scope.
  const { data: pipelineRow, error: pipeErr } = await supabase
    .from('pipeline')
    .select('id, user_id, listing_id, url, company, title, score, dimension_scores, gap_analysis, notes, status, eval_date, created_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (pipeErr) return jsonError(500, pipeErr.message);
  if (!pipelineRow) return jsonError(404, 'Pipeline entry not found');

  let listingRow: {
    id: string;
    url: string;
    jd_text: string | null;
    company: string | null;
    title: string | null;
    source: string | null;
  } | null = null;
  if (pipelineRow.listing_id) {
    const { data: listing } = await supabase
      .from('listings')
      .select('id, url, jd_text, company, title, source')
      .eq('id', pipelineRow.listing_id)
      .eq('user_id', user.id)
      .maybeSingle();
    listingRow = listing;
  }

  return jsonOk({ pipeline: pipelineRow, listing: listingRow });
}
