import { parseApplications } from '@/lib/parse-applications';
import { parsePipeline } from '@/lib/parse-pipeline';
import { applicationsPath, pipelinePath } from '@/lib/api-paths';
import { TodayHero } from '@/components/TodayHero';
import type { ParseError } from '@/lib/schemas';

/**
 * /today landing page.
 *
 * Server component: directly invokes the same parsers the API routes use
 * (NOT fetch('/api/applications') — that creates an SSR self-fetch loop).
 *
 * Closes PAG-01 (ProgressMeter + Follow-ups + Top 5) and PAG-05 (pixelBootUp via TodayHero wrapper).
 */
export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  const [appsResult, pipeResult] = await Promise.all([
    parseApplications(applicationsPath()),
    parsePipeline(pipelinePath()),
  ]);

  const parseErrors: ParseError[] = [...appsResult.errors, ...pipeResult.errors];
  // Server-supplied "today" (YYYY-MM-DD), localtime — single user, single timezone.
  const today = new Date().toISOString().slice(0, 10);

  return (
    <TodayHero
      applications={appsResult.data}
      pipeline={pipeResult.data}
      parseErrors={parseErrors}
      today={today}
    />
  );
}
