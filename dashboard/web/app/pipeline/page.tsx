import { parsePipeline } from '@/lib/parse-pipeline';
import { pipelinePath } from '@/lib/api-paths';
import { PipelineTable } from '@/components/PipelineTable';
import type { ParseError } from '@/lib/schemas';

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
  const result = await parsePipeline(pipelinePath());
  const parseErrors: ParseError[] = result.errors;

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
      <PipelineTable rows={result.data} />
    </div>
  );
}
