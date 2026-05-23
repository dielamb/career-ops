// POST /api/scan/run — per-user portal scan.
//
// Hits Greenhouse/Ashby/Lever public APIs for each enabled company in
// `portals.yml`, filters titles via the global title_filter, dedups against
// the caller's existing `listings` rows, and inserts new matches with
// `user_id = auth.uid()`.
//
// Optional body: `{ companies?: string[] }` to limit the scan to a subset
// of tracked company names (case-insensitive match). Default: all enabled
// companies.
//
// Response: `{ added, skipped_dup, skipped_filter, scanned, no_api, errors }`.

import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase-server';
import { jsonError } from '@/lib/api-helpers';
import { canonicalUrl } from '@/lib/canonical-url';
import { loadPortals, type TrackedCompany } from '@/lib/portals-loader';
import { matchesTitle } from '@/lib/title-filter';
import {
  detectProvider,
  fetchJobsForProvider,
  type AtsProviderId,
} from '@/lib/ats-providers';

export const dynamic = 'force-dynamic';
// Keep well under typical platform 30-60s function caps; we self-limit at 55s.
export const maxDuration = 60;

const Body = z.object({
  companies: z.array(z.string()).optional(),
});

const SCAN_TIMEOUT_MS = 55_000;
const CONCURRENCY = 5;

interface ScanResult {
  added: number;
  skipped_dup: number;
  skipped_filter: number;
  scanned: number;
  no_api: number;
  errors: string[];
}

interface CompanyTask {
  company: TrackedCompany;
  provider: AtsProviderId;
}

/** Run async tasks with a fixed-size worker pool. */
async function runPool<T, R>(
  items: T[],
  size: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let idx = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (idx < items.length) {
      const cur = idx++;
      results[cur] = await worker(items[cur]);
    }
  });
  await Promise.all(runners);
  return results;
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return jsonError(401, 'Unauthorized');

  // Body is optional — empty body is treated as `{}`.
  let body: z.infer<typeof Body> = {};
  try {
    const raw = await req.json();
    const parsed = Body.safeParse(raw);
    if (!parsed.success) return jsonError(400, 'Invalid body');
    body = parsed.data;
  } catch { /* no body */ }

  let portals;
  try {
    portals = await loadPortals();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return jsonError(500, `Failed to load portals.yml: ${msg}`);
  }

  // M3: merge per-user title_filter override into the global one. User
  // keywords are additive — they extend, never replace, the curated default.
  const { data: profileForFilter } = await supabase
    .from('profiles')
    .select('scoring_prefs')
    .eq('user_id', user.id)
    .single();
  const userPrefs = (profileForFilter?.scoring_prefs ?? {}) as Record<string, unknown>;
  const userFilter = (userPrefs.title_filter ?? {}) as { positive?: string[]; negative?: string[] };
  const titleFilter = {
    positive: [...portals.titleFilter.positive, ...(userFilter.positive ?? [])],
    negative: [...portals.titleFilter.negative, ...(userFilter.negative ?? [])],
  };

  // Subset filter (optional). Case-insensitive name match.
  let companies = portals.trackedCompanies;
  if (body.companies && body.companies.length > 0) {
    const wanted = new Set(body.companies.map((c) => c.toLowerCase()));
    companies = companies.filter((c) => wanted.has(c.name.toLowerCase()));
  }

  // Bucket by provider support up front so the response can report companies
  // we can't reach via API today (Workday, branded HTML, etc.).
  const tasks: CompanyTask[] = [];
  let noApi = 0;
  for (const c of companies) {
    const provider = detectProvider(c.careers_url);
    if (!provider) { noApi++; continue; }
    tasks.push({ company: c, provider });
  }

  // Preload user's listing URLs once for dedup; canonical-form set.
  const { data: existing, error: listErr } = await supabase
    .from('listings')
    .select('url')
    .eq('user_id', user.id);
  if (listErr) return jsonError(500, `Failed to read listings: ${listErr.message}`);
  const seen = new Set<string>((existing ?? []).map((r) => canonicalUrl(r.url)));

  const result: ScanResult = {
    added: 0,
    skipped_dup: 0,
    skipped_filter: 0,
    scanned: tasks.length,
    no_api: noApi,
    errors: [],
  };

  // Overall timeout guard. If we exceed it, we still return whatever we
  // managed to insert; the user can re-run to pick up the rest.
  const deadline = Date.now() + SCAN_TIMEOUT_MS;
  const timedOut = () => Date.now() > deadline;

  const toInsert: Array<{
    user_id: string;
    url: string;
    jd_text: null;
    company: string;
    title: string;
    source: AtsProviderId;
  }> = [];

  await runPool(tasks, CONCURRENCY, async ({ company, provider }) => {
    if (timedOut()) return;
    let jobs;
    try {
      jobs = await fetchJobsForProvider(provider, company.careers_url, company.api);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      result.errors.push(`${company.name} (${provider}): ${msg}`);
      return;
    }
    for (const job of jobs) {
      if (!matchesTitle(job.title, titleFilter)) {
        result.skipped_filter++;
        continue;
      }
      const canonical = canonicalUrl(job.url);
      if (seen.has(canonical)) {
        result.skipped_dup++;
        continue;
      }
      seen.add(canonical);
      toInsert.push({
        user_id: user.id,
        url: canonical,
        jd_text: null,
        company: company.name,
        title: job.title,
        source: provider,
      });
    }
  });

  // Single batched insert keeps RLS round-trips minimal. If supabase errors
  // on a unique-constraint race (concurrent scans), we surface it but don't
  // blow up the whole response.
  if (toInsert.length > 0) {
    const { data: inserted, error: insertErr } = await supabase
      .from('listings')
      .insert(toInsert)
      .select('id, url, company, title');
    if (insertErr) {
      result.errors.push(`insert listings failed: ${insertErr.message}`);
    } else if (inserted) {
      result.added = inserted.length;

      // M2: also seed pipeline rows so scanned listings show up in /pipeline
      // as `pending` (no score yet). User can click row → modal → "Evaluate"
      // to run the Anthropic scoring on demand.
      const pipelineRows = inserted.map((l) => ({
        user_id: user.id,
        listing_id: l.id,
        url: l.url,
        company: l.company,
        title: l.title,
        status: 'pending' as const,
      }));
      const { error: pipeErr } = await supabase.from('pipeline').insert(pipelineRows);
      if (pipeErr) {
        result.errors.push(`insert pipeline failed: ${pipeErr.message}`);
      }
    }
  }

  return Response.json(result, { status: 200 });
}
