// ATS URL detection and job description fetching
// Supports: Greenhouse, Ashby, Lever
// LinkedIn: returns null (paste-fallback required)

export interface FetchedJob {
  ats: 'greenhouse' | 'ashby' | 'lever' | 'unknown';
  company: string | null;
  title: string | null;
  jdText: string;
  sourceUrl: string;
}

export class AtsFetchError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'AtsFetchError';
  }
}

// ── ATS detection from a single job posting URL ──────────────────

type AtsType = 'greenhouse' | 'ashby' | 'lever' | 'unknown';

interface AtsInfo {
  type: AtsType;
  apiUrl: string;
  jobId?: string;
  boardSlug?: string;
}

export function detectAts(rawUrl: string): AtsInfo | null {
  let u: URL;
  try { u = new URL(rawUrl); } catch { return null; }

  const host = u.hostname.replace(/^www\./, '');
  const path = u.pathname.replace(/\/+$/, '');

  // Greenhouse: boards.greenhouse.io/{board}/jobs/{id}
  const ghMatch =
    path.match(/\/jobs\/(\d+)/) ||
    u.searchParams.get('gh_jid');

  if (
    host.includes('greenhouse.io') ||
    host.includes('grnh.se') ||
    (ghMatch && u.searchParams.has('gh_jid'))
  ) {
    const boardMatch = path.match(/\/([^/]+)\/jobs\/(\d+)/);
    if (boardMatch) {
      return {
        type: 'greenhouse',
        apiUrl: `https://boards-api.greenhouse.io/v1/boards/${boardMatch[1]}/jobs/${boardMatch[2]}`,
        jobId: boardMatch[2],
        boardSlug: boardMatch[1],
      };
    }
    const ghJid = u.searchParams.get('gh_jid');
    if (ghJid) {
      const boardSlug = path.split('/').find((s) => s && !s.match(/^\d+$/)) ?? 'unknown';
      return {
        type: 'greenhouse',
        apiUrl: `https://boards-api.greenhouse.io/v1/boards/${boardSlug}/jobs/${ghJid}`,
        jobId: ghJid,
        boardSlug,
      };
    }
    return null;
  }

  // Ashby: jobs.ashbyhq.com/{company}/{jobId}
  const ashbyMatch = host.match(/^jobs\.ashbyhq\.com$/) &&
    path.match(/^\/([^/]+)\/([^/]+)/);
  if (ashbyMatch) {
    const [, company, jobId] = ashbyMatch;
    return {
      type: 'ashby',
      apiUrl: `https://api.ashbyhq.com/posting-api/job-board/${company}/postings/${jobId}`,
      jobId,
      boardSlug: company,
    };
  }

  // Lever: jobs.lever.co/{company}/{jobId}
  const leverMatch = host === 'jobs.lever.co' &&
    path.match(/^\/([^/]+)\/([a-f0-9-]{36})/);
  if (leverMatch) {
    const [, company, jobId] = leverMatch;
    return {
      type: 'lever',
      apiUrl: `https://api.lever.co/v0/postings/${company}/${jobId}`,
      jobId,
      boardSlug: company,
    };
  }

  return { type: 'unknown', apiUrl: rawUrl };
}

// ── Fetch with 10s timeout ────────────────────────────────────────

async function fetchWithTimeout(url: string, timeout = 10_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'career-ops/1.0' },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ── ATS-specific parsers ──────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function fetchGreenhouse(apiUrl: string): Promise<FetchedJob> {
  const res = await fetchWithTimeout(apiUrl);
  if (!res.ok) throw new AtsFetchError(`Greenhouse API ${res.status}`, res.status);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();

  const title: string = data.title ?? '';
  const company: string = data.company?.name ?? null;
  const content = stripHtml(data.content ?? '');
  const location = data.location?.name ? `Location: ${data.location.name}\n\n` : '';

  return {
    ats: 'greenhouse',
    company,
    title,
    jdText: `${title}\n\n${location}${content}`,
    sourceUrl: data.absolute_url ?? apiUrl,
  };
}

async function fetchAshby(apiUrl: string): Promise<FetchedJob> {
  const res = await fetchWithTimeout(apiUrl);
  if (!res.ok) throw new AtsFetchError(`Ashby API ${res.status}`, res.status);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();

  const job = data.posting ?? data;
  const title: string = job.title ?? '';
  const company: string = job.organizationName ?? null;
  const desc = stripHtml(job.descriptionHtml ?? job.description ?? '');
  const location = job.isRemote ? 'Remote\n\n' : (job.location ? `${job.location}\n\n` : '');

  return {
    ats: 'ashby',
    company,
    title,
    jdText: `${title}\n\n${location}${desc}`,
    sourceUrl: job.jobUrl ?? apiUrl,
  };
}

async function fetchLever(apiUrl: string): Promise<FetchedJob> {
  const res = await fetchWithTimeout(apiUrl);
  if (!res.ok) throw new AtsFetchError(`Lever API ${res.status}`, res.status);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();

  const title: string = data.text ?? '';
  const company: string = data.company ?? null;
  const description = stripHtml(data.description ?? '');
  const lists = (data.lists ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((l: any) => `${l.text}:\n${stripHtml(l.content)}`)
    .join('\n\n');
  const location = data.categories?.location ? `Location: ${data.categories.location}\n\n` : '';

  return {
    ats: 'lever',
    company,
    title,
    jdText: `${title}\n\n${location}${description}\n\n${lists}`.trim(),
    sourceUrl: data.hostedUrl ?? apiUrl,
  };
}

// ── Main entry point ──────────────────────────────────────────────

export async function fetchJobDescription(url: string): Promise<FetchedJob> {
  const info = detectAts(url);
  if (!info) throw new AtsFetchError('Invalid URL');

  switch (info.type) {
    case 'greenhouse': return fetchGreenhouse(info.apiUrl);
    case 'ashby':      return fetchAshby(info.apiUrl);
    case 'lever':      return fetchLever(info.apiUrl);
    default:
      // Unknown ATS — return URL as-is; caller handles manual paste
      throw new AtsFetchError(
        'Unknown ATS format. Paste the job description text manually.',
      );
  }
}
