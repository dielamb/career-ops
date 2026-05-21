import { parsePipeline } from '@/lib/parse-pipeline';
import { parseApplications } from '@/lib/parse-applications';
import { pipelinePath, applicationsPath } from '@/lib/api-paths';
import { PipelineTable } from '@/components/PipelineTable';
import type { ParseError, PipelineEntry, Application } from '@/lib/schemas';

/**
 * /pipeline server page.
 *
 * Closes PAG-02: sortable + filterable table over 192 rows with filter chips
 * (state, source, score range), search-as-you-type, and modal-on-row-click.
 *
 * Pattern matches /today (Plan 05-01): server component invokes parsers directly
 * to avoid the SSR self-fetch pitfall.
 */
export const dynamic = 'force-dynamic';

export default async function PipelinePage() {
  const [pipelineResult, applicationsResult] = await Promise.all([
    parsePipeline(pipelinePath()),
    parseApplications(applicationsPath()),
  ]);
  const parseErrors: ParseError[] = pipelineResult.errors;

  // Build map: pipeline num → application status (so /pipeline view reflects mark-sent updates).
  const appStatusByNum = new Map<number, Application['status']>();
  for (const app of applicationsResult.data) {
    appStatusByNum.set(app.num, app.status);
  }

  return (
    <div className="flex flex-col gap-lg">
      {parseErrors.length > 0 && (
        <div
          role="alert"
          data-testid="pipeline-parse-errors-banner"
          className="bg-magenta-soft border-[2.5px] border-magenta p-md rounded-none"
        >
          <p className="font-mono text-xs uppercase tracking-wider text-ink mb-xs">
            // {parseErrors.length} pipeline parse {parseErrors.length === 1 ? 'error' : 'errors'} skipped
          </p>
          <p className="font-body text-sm text-ink-soft">
            Table rendered with valid rows only. Check data/pipeline.md.
          </p>
        </div>
      )}
      <PipelineTable rows={pipelineResult.data} appStatusByNum={Object.fromEntries(appStatusByNum)} />
    </div>
  );
}
