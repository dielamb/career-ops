// Ashby public job-board posting API.
// Accepts `https://jobs.ashbyhq.com/{slug}` careers URL.

import { fetchJson } from './http';
import type { AtsJob } from './types';

interface AshbyJob {
  title?: string;
  jobUrl?: string;
  location?: string;
}

interface AshbyResponse {
  jobs?: AshbyJob[];
}

function deriveApiUrl(careersUrl: string): string | null {
  try {
    const u = new URL(careersUrl);
    if (u.hostname !== 'jobs.ashbyhq.com') return null;
    const m = u.pathname.match(/^\/([^/?#]+)/);
    if (!m) return null;
    return `https://api.ashbyhq.com/posting-api/job-board/${m[1]}?includeCompensation=true`;
  } catch {
    return null;
  }
}

export async function fetchJobs(careersUrl: string): Promise<AtsJob[]> {
  const apiUrl = deriveApiUrl(careersUrl);
  if (!apiUrl) return [];
  const data = await fetchJson<AshbyResponse>(apiUrl);
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
  return jobs
    .filter((j): j is AshbyJob & { jobUrl: string } => !!j.jobUrl)
    .map((j) => ({
      title: j.title ?? '',
      url: j.jobUrl,
      location: j.location,
    }));
}
