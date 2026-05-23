// Provider detection + dispatch for the per-user scan endpoint.
// Only the three ATS APIs we hit directly are listed; everything else
// (branded careers pages, Workday, custom HTML, etc.) is skipped at the
// detection step and surfaced as "no ATS API support" in the scan response.

import * as greenhouse from './greenhouse';
import * as ashby from './ashby';
import * as lever from './lever';
import type { AtsJob, AtsProviderId } from './types';

export type { AtsJob, AtsProviderId };

export function detectProvider(careersUrl: string): AtsProviderId | null {
  let host: string;
  try {
    host = new URL(careersUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (host.endsWith('.greenhouse.io')) return 'greenhouse';
  if (host === 'jobs.ashbyhq.com') return 'ashby';
  if (host === 'jobs.lever.co') return 'lever';
  return null;
}

export async function fetchJobsForProvider(
  provider: AtsProviderId,
  careersUrl: string,
  apiOverride?: string,
): Promise<AtsJob[]> {
  switch (provider) {
    case 'greenhouse':
      return greenhouse.fetchJobs(careersUrl, apiOverride);
    case 'ashby':
      return ashby.fetchJobs(careersUrl);
    case 'lever':
      return lever.fetchJobs(careersUrl);
  }
}
