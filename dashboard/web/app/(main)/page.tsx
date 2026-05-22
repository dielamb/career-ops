import { createServerSupabase } from '@/lib/supabase-server';
import { TodayHero } from '@/components/TodayHero';
import { ActiveScans } from '@/components/ActiveScans';
import type { Application, PipelineEntry } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  const supabase = await createServerSupabase();

  const [{ data: dbApplications }, { data: dbPipeline }] = await Promise.all([
    supabase.from('applications').select('*').order('created_at', { ascending: false }),
    supabase.from('pipeline').select('*').order('created_at', { ascending: false }),
  ]);

  // Map Supabase rows → legacy Application interface (TodayHero expects this shape)
  const applications: Application[] = (dbApplications ?? []).map((row, i) => ({
    num:        i + 1,
    date:       row.submitted_at ? row.submitted_at.slice(0, 10) : row.created_at.slice(0, 10),
    company:    row.company,
    role:       row.role,
    score:      null,
    status:     'Applied' as Application['status'],
    pdf:        false,
    reportPath: null,
    notes:      row.notes ?? '',
  }));

  // Map Supabase rows → legacy PipelineEntry interface
  const pipeline: PipelineEntry[] = (dbPipeline ?? []).map((row) => ({
    state:   (row.status === 'evaluated' ? 'evaluated'
             : row.status === 'skipped'  ? 'skipped'
             : row.status === 'error'    ? 'error'
             :                             'pending') as PipelineEntry['state'],
    num:     null,
    url:     row.url ?? '',
    company: row.company ?? null,
    title:   row.title ?? null,
    score:   row.score ?? null,
    pdf:     row.pdf_path != null,
    note:    row.notes ?? null,
  }));

  const today = new Date().toISOString().slice(0, 10);

  return (
    <TodayHero
      applications={applications}
      pipeline={pipeline}
      parseErrors={[]}
      today={today}
      afterMetrics={<ActiveScans />}
    />
  );
}
