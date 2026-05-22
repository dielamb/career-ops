import { spawn } from 'node:child_process';
import { openSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { jsonOk, jsonError } from '@/lib/api-helpers';
import { repoRoot } from '@/lib/api-paths';
import { validateUrl, InvalidUrlError } from '@/lib/spawn-mjs';
import { cleanClaudeEnv } from '@/lib/clean-claude-env';

export const dynamic = 'force-dynamic';

const AddUrlBody = z.object({
  url: z.string().min(1),
});

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonError(400, 'Invalid JSON body');
  }

  const parsed = AddUrlBody.safeParse(raw);
  if (!parsed.success) {
    return jsonError(400, 'Invalid input', parsed.error.issues);
  }

  const { url } = parsed.data;

  try {
    validateUrl(url);
  } catch (err) {
    if (err instanceof InvalidUrlError) {
      return jsonError(400, err.message);
    }
    throw err;
  }

  // Reject job-board aggregator root URLs — oferta.md mode evaluates a SINGLE
  // posting, not a listing page. Single-offer URLs on these domains have a
  // deeper path (e.g. /jobs/{id}), so allow those through.
  const aggregatorMessage = detectJobAggregatorRoot(url);
  if (aggregatorMessage) {
    return jsonError(400, aggregatorMessage);
  }

  const root = repoRoot();
  const ofertaPath = path.join(root, 'modes', 'oferta.md');
  const profilePath = path.join(root, 'modes', '_profile.md');
  const ts = Date.now();
  const logPath = `/tmp/eval-${ts}.md`;
  const logFd = openSync(logPath, 'w');

  // Prompt passes url as plain arg — no shell interpolation (array-form spawn).
  const prompt = `@${ofertaPath} @${profilePath} ${url}`;

  // Strip ANTHROPIC_API_KEY + CLAUDECODE/CLAUDE_CODE_* so the spawned claude
  // runs as a standalone CLI on subscription auth, even when the dev server
  // itself was launched from inside a Claude Code session.
  const env = cleanClaudeEnv();

  const child = spawn('claude', ['-p', prompt], {
    cwd: root,
    detached: true,
    stdio: ['ignore', logFd, logFd],
    shell: false,
    env,
  });
  child.unref();

  return jsonOk({ ok: true, logPath, startedAt: new Date(ts).toISOString() }, { status: 202 });
}

/**
 * Known job-aggregator domains. Listing/root URLs on these sites cannot be
 * evaluated by oferta.md (which expects a single posting). Returns a
 * user-friendly error message if the URL is a listing root, or null if it
 * looks like a single-posting path (≥2 path segments under /jobs|/listing|/job).
 */
function detectJobAggregatorRoot(rawUrl: string): string | null {
  let parsed: URL;
  try { parsed = new URL(rawUrl); } catch { return null; }

  const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
  const path = parsed.pathname.replace(/\/+$/, '');
  const segments = path.split('/').filter(Boolean);

  // Aggregator boards: must drill into a specific posting.
  const aggregators: Record<string, { name: string; postingPrefix?: string }> = {
    'designsystems.jobs':   { name: 'designsystems.jobs',   postingPrefix: 'jobs' },
    'remoteok.com':         { name: 'Remote OK',            postingPrefix: 'remote-jobs' },
    'weworkremotely.com':   { name: 'We Work Remotely',     postingPrefix: 'remote-jobs' },
    'workingnomads.com':    { name: 'Working Nomads',       postingPrefix: 'jobs' },
    'remote.co':            { name: 'Remote.co',            postingPrefix: 'job' },
    'wellfound.com':        { name: 'Wellfound (AngelList)', postingPrefix: 'jobs' },
    'angel.co':             { name: 'AngelList',            postingPrefix: 'jobs' },
    'glassdoor.com':        { name: 'Glassdoor',            postingPrefix: 'job-listing' },
    'indeed.com':           { name: 'Indeed',               postingPrefix: 'viewjob' },
    'linkedin.com':         { name: 'LinkedIn Jobs',        postingPrefix: 'jobs/view' },
    'jobgether.com':        { name: 'Jobgether',            postingPrefix: 'offer' },
  };

  const config = aggregators[host];
  if (!config) return null;

  // Single posting heuristic: path includes the posting prefix segment AND has
  // at least one segment after it (the job id/slug).
  if (config.postingPrefix) {
    const prefixSegs = config.postingPrefix.split('/');
    const idx = segments.findIndex((s, i) =>
      prefixSegs.every((p, j) => segments[i + j] === p),
    );
    if (idx !== -1 && segments.length > idx + prefixSegs.length) return null;
  }

  return `${config.name} is a job aggregator — paste the URL of a specific posting (not the listing page). Tip: open ${parsed.origin}/ in your browser, click a job, then copy that URL.`;
}
