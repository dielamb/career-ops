import { parsePipeline } from '@/lib/parse-pipeline';
import { parseApplications } from '@/lib/parse-applications';
import { parseScanHistoryByUrl } from '@/lib/parse-scan-history';
import { pipelinePath, applicationsPath, scanHistoryPath } from '@/lib/api-paths';
import { PipelineTable } from '@/components/PipelineTable';
import type { ParseError, Application, EnrichedPipelineEntry } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export default async function PipelinePage() {
  const [pipelineResult, applicationsResult, scanHistory] = await Promise.all([
    parsePipeline(pipelinePath()),
    parseApplications(applicationsPath()),
    parseScanHistoryByUrl(scanHistoryPath()),
  ]);

  const parseErrors: ParseError[] = pipelineResult.errors;

  // num → application (for status, notes, date)
  const appByNum = new Map<number, Application>();
  for (const app of applicationsResult.data) appByNum.set(app.num, app);

  // num → application status for the dropdown (exclude SKIP)
  const appStatusByNum = new Map<number, Exclude<Application['status'], 'SKIP'>>();
  for (const app of applicationsResult.data) {
    if (app.status !== 'SKIP') appStatusByNum.set(app.num, app.status);
  }

  // Enrich pipeline rows with cross-source data
  const rows: EnrichedPipelineEntry[] = pipelineResult.data.map((entry) => {
    const app = entry.num != null ? appByNum.get(entry.num) : undefined;
    return {
      ...entry,
      evalDate:  app?.date ?? null,
      appNotes:  app?.notes ?? null,
      firstSeen: scanHistory.get(entry.url) ?? null,
    };
  });

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
      <PipelineTable rows={rows} appStatusByNum={Object.fromEntries(appStatusByNum)} />
    </div>
  );
}
