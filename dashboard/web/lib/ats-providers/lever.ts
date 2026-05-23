// Lever public postings API.
// Accepts `https://jobs.lever.co/{slug}` careers URL.

import { fetchJson } from './http';
import type { AtsJob } from './types';

interface LeverJob {
  text?: string;
  hostedUrl?: string;
  categories?: { location?: string };
}

function deriveApiUrl(careersUrl: string): string | null {
  try {
    const u = new URL(careersUrl);
    if (u.hostname !== 'jobs.lever.co') return null;
    const m = u.pathname.match(/^\/([^/?#]+)/);
    if (!m) return null;
    return `https://api.lever.co/v0/postings/${m[1]}?mode=json`;
  } catch {
    return null;
  }
}

export async function fetchJobs(careersUrl: string): Promise<AtsJob[]> {
  const apiUrl = deriveApiUrl(careersUrl);
  if (!apiUrl) return [];
  const data = await fetchJson<LeverJob[]>(apiUrl);
  if (!Array.isArray(data)) return [];
  return data
    .filter((j): j is LeverJob & { hostedUrl: string } => !!j.hostedUrl)
    .map((j) => ({
      title: j.text ?? '',
      url: j.hostedUrl,
      location: j.categories?.location,
    }));
}
