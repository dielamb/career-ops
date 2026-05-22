import { promises as fs } from 'node:fs';
import path from 'node:path';
import { outputDir } from '@/lib/api-paths';
import { jsonError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/file?path=/abs/path/to/output/001.pdf
 *
 * Streams a PDF from disk ONLY when the resolved real path sits under outputDir().
 * Path-traversal guarded. Only .pdf files served.
 *
 * Required by PAG-03: PDF iframe inside ListingModal.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const requested = url.searchParams.get('path');
  if (!requested) return jsonError(400, 'Missing path');

  const root = await fs.realpath(outputDir()).catch(() => outputDir());
  let resolved: string;
  try {
    resolved = await fs.realpath(requested);
  } catch {
    return jsonError(404, 'File not found');
  }

  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    return jsonError(400, 'Forbidden path');
  }
  if (!resolved.toLowerCase().endsWith('.pdf')) {
    return jsonError(400, 'Only .pdf files served');
  }

  const buf = await fs.readFile(resolved);
  return new Response(new Uint8Array(buf), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-length': String(buf.length),
      'cache-control': 'no-store',
    },
  });
}
