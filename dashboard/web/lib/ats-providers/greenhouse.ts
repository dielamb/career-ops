// Greenhouse public boards API.
// Accepts either a branded `boards.greenhouse.io/{slug}` careers URL or an
// explicit `api:` override from portals.yml (used when a company hosts its
// own careers domain that still proxies to Greenhouse).

import { fetchJson } from './http';
import type { AtsJob } from './types';

const ALLOWED_HOSTS = new Set([
  'boards-api.greenhouse.io',
  'boards.greenhouse.io',
  'job-boards.greenhouse.io',
  'job-boards.eu.greenhouse.io',
]);

interface GreenhouseJob {
  title?: string;
  absolute_url?: string;
  location?: { name?: string };
}

interface GreenhouseResponse {
  jobs?: GreenhouseJob[];
}

function deriveApiUrl(careersUrl: string, apiOverride?: string): string | null {
  if (apiOverride) {
    try {
      const u = new URL(apiOverride);
      if (ALLOWED_HOSTS.has(u.hostname)) return apiOverride;
    } catch { /* fall through to slug parse */ }
  }
  try {
    const u = new URL(careersUrl);
    const m = u.pathname.match(/^\/([^/?#]+)/);
    if (!m) return null;
    const slug = m[1];
    if (u.hostname.endsWith('.greenhouse.io')) {
      return `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`;
    }
  } catch { /* not a URL */ }
  return null;
}

export async function fetchJobs(
  careersUrl: string,
  apiOverride?: string,
): Promise<AtsJob[]> {
  const apiUrl = deriveApiUrl(careersUrl, apiOverride);
  if (!apiUrl) return [];
  const data = await fetchJson<GreenhouseResponse>(apiUrl, { redirect: 'error' });
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
  return jobs
    .filter((j): j is GreenhouseJob & { absolute_url: string } => !!j.absolute_url)
    .map((j) => ({
      title: j.title ?? '',
      url: j.absolute_url,
      location: j.location?.name,
    }));
}
