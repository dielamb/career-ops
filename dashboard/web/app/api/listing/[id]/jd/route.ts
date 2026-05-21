import { NextRequest } from 'next/server';
import { parseReports } from '@/lib/parse-reports';
import { reportsDir, outputDir } from '@/lib/api-paths';
import { jsonOk, jsonError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

function matchesId(report: { num: number; slug: string; date: string }, id: string): boolean {
  const fullId = `${String(report.num).padStart(3, '0')}-${report.slug}-${report.date}`;
  return id === fullId || id === report.slug || id === String(report.num);
}

/**
 * Strip HTML to plain text. Removes scripts/styles, decodes basic entities,
 * collapses whitespace. Not a full HTML parser — good enough for job descriptions.
 */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/(h[1-6]|li|div|section|article)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * GET /api/listing/[id]/jd
 *
 * Fetches the original job description from listing's URL and returns extracted plain text.
 * 5s timeout. Returns 502 if fetch fails or page is empty.
 *
 * NOTE: Many job sites block headless fetches or require JS. For those, returns
 * a hint that user should open in Chrome.
 */
export async function GET(
  _req: NextRequest | Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const { data } = await parseReports(reportsDir(), outputDir());
  const report = data.find(r => matchesId(r, id));

  if (!report) {
    return jsonError(404, 'Listing not found');
  }

  if (!report.url) {
    return jsonOk({ url: null, content: null, error: 'No URL on file' });
  }

  let html: string;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(report.url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return jsonOk({
        url: report.url,
        content: null,
        error: `Fetch failed: HTTP ${res.status} — site may block bots or require login. Open in Chrome.`,
      });
    }
    html = await res.text();
  } catch (err) {
    return jsonOk({
      url: report.url,
      content: null,
      error: `Fetch failed: ${err instanceof Error ? err.message : 'unknown'} — open in Chrome.`,
    });
  }

  const text = htmlToText(html);
  if (text.length < 100) {
    return jsonOk({
      url: report.url,
      content: null,
      error: 'Page content too small — likely JS-rendered SPA. Open in Chrome.',
    });
  }

  // Truncate to 12000 chars to avoid massive responses
  const truncated = text.length > 12000 ? text.slice(0, 12000) + '\n\n[... truncated]' : text;

  return jsonOk({
    url: report.url,
    content: truncated,
    error: null,
  });
}
