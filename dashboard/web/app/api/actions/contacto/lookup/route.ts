import { promises as fs } from 'node:fs';
import { jsonOk, jsonError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/actions/contacto/lookup?company={raw company name}
 *
 * Searches /tmp/contacto-{slug}-{ts}.md for files matching the company slug.
 * Returns the latest file's content (by ts in filename).
 *
 * Used by ListingModal on re-open: if contacts were already fetched for this company,
 * show them immediately without spawning claude again.
 */
function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const company = searchParams.get('company');
  if (!company) return jsonError(400, 'Missing company');

  const slug = slugify(company);
  if (!slug) return jsonOk({ content: null });

  let entries: string[];
  try {
    entries = await fs.readdir('/tmp');
  } catch {
    return jsonOk({ content: null });
  }

  // Match contacto-{slug-prefix}-{ts}.md where slug-prefix starts with our slug.
  // Slug in route is truncated to 40 chars; the lookup query company may not match exact slug,
  // so do prefix match on first 20 chars (works for "fever", "remote", etc.)
  const prefix = `contacto-${slug.slice(0, 20)}`;
  const matches = entries
    .filter((f) => f.startsWith(prefix) && f.endsWith('.md'))
    .sort()
    .reverse(); // latest first by ts in filename

  if (matches.length === 0) return jsonOk({ content: null });

  // Read latest matching file
  let content: string;
  try {
    content = await fs.readFile(`/tmp/${matches[0]}`, 'utf8');
  } catch {
    return jsonOk({ content: null });
  }

  if (!content.trim()) return jsonOk({ content: null });

  return jsonOk({ content, source: matches[0] });
}
