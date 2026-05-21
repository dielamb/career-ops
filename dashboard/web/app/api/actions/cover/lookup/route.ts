import { promises as fs } from 'node:fs';
import { jsonOk, jsonError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/actions/cover/lookup?listingId={id}
 * Returns latest /tmp/cover-{listingId}-{ts}.md content if exists.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get('listingId');
  if (!listingId) return jsonError(400, 'Missing listingId');
  if (!/^[a-zA-Z0-9_-]+$/.test(listingId)) return jsonError(400, 'Invalid listingId');

  let entries: string[];
  try {
    entries = await fs.readdir('/tmp');
  } catch {
    return jsonOk({ content: null });
  }

  const prefix = `cover-${listingId}-`;
  const matches = entries
    .filter((f) => f.startsWith(prefix) && f.endsWith('.md'))
    .sort()
    .reverse();

  if (matches.length === 0) return jsonOk({ content: null });

  let content: string;
  try {
    content = await fs.readFile(`/tmp/${matches[0]}`, 'utf8');
  } catch {
    return jsonOk({ content: null });
  }
  if (!content.trim()) return jsonOk({ content: null });

  return jsonOk({ content, source: matches[0] });
}
