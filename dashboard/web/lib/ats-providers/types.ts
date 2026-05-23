// Shared types for ATS provider listing fetchers.
// These return *posting summaries* (used by the scanner to build candidate
// listings). For full job description fetching of an individual URL, see
// `lib/ats-fetch.ts`.

export interface AtsJob {
  title: string;
  url: string;
  location?: string;
}

export type AtsProviderId = 'greenhouse' | 'ashby' | 'lever';
