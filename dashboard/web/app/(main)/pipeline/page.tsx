import { createServerSupabase } from '@/lib/supabase-server';
import { PipelineTable } from '@/components/PipelineTable';
import type { EnrichedPipelineEntry } from '@/lib/schemas';
import type { PipelineStatus } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

const STATUS_TO_APP_STATUS: Partial<Record<PipelineStatus, Exclude<import('@/lib/schemas').Application['status'], 'SKIP'>>> = {
  applied:    'Applied',
  responded:  'Responded',
  interview:  'Interview',
  offer:      'Offer',
  rejected:   'Rejected',
};

export default async function PipelinePage() {
  const supabase = await createServerSupabase();

  const [{ data: pipelineRows }, { data: appRows }] = await Promise.all([
    supabase
      .from('pipeline')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false }),
  ]);

  // Map Supabase pipeline rows → EnrichedPipelineEntry (existing frontend interface)
  const rows: EnrichedPipelineEntry[] = (pipelineRows ?? []).map((row) => ({
    state:    (row.status === 'evaluated' ? 'evaluated'
             : row.status === 'skipped'   ? 'skipped'
             : row.status === 'error'     ? 'error'
             :                              'pending') as EnrichedPipelineEntry['state'],
    num:      null,
    url:      row.url ?? '',
    company:  row.company ?? null,
    title:    row.title ?? null,
    score:    row.score ?? null,
    pdf:      row.pdf_path != null,
    note:     row.notes ?? null,
    evalDate: row.eval_date ?? null,
    appNotes: null,
    firstSeen: null,
    // Supabase-native fields (extras, not in EnrichedPipelineEntry but safe to spread)
    id:       row.id,
    dbStatus: row.status,
    dimensionScores: row.dimension_scores,
    gapAnalysis: row.gap_analysis,
  }));

  // Map pipeline id → app status for dropdown
  const appStatusByPipelineId = new Map<string, Exclude<import('@/lib/schemas').Application['status'], 'SKIP'>>();
  for (const app of (appRows ?? [])) {
    if (app.pipeline_id) {
      const mapped = STATUS_TO_APP_STATUS[app.pipeline_id as PipelineStatus];
      if (mapped) appStatusByPipelineId.set(app.pipeline_id, mapped);
    }
  }

  // Legacy compatibility: keyed by num (null for all Supabase rows) → empty map
  const appStatusByNum: Record<number, Exclude<import('@/lib/schemas').Application['status'], 'SKIP'>> = {};

  return (
    <div className="flex flex-col gap-lg">
      {rows.length === 0 && (
        <div className="border-[2.5px] border-chrome p-xl rounded-none text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-muted mb-xs">
            // pipeline empty
          </p>
          <p className="font-body text-sm text-ink-soft">
            Add job URLs via the sidebar to start evaluating.
          </p>
        </div>
      )}
      {rows.length > 0 && (
        <PipelineTable rows={rows} appStatusByNum={appStatusByNum} />
      )}
    </div>
  );
}
