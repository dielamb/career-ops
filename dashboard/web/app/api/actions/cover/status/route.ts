import { promises as fs } from 'node:fs';
import { jsonOk, jsonError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/actions/cover/status?logPath=/tmp/cover-{id}-{ts}.md
 * Returns { done: boolean, content: string }
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const logPath = searchParams.get('logPath');

  if (!logPath || !logPath.startsWith('/tmp/cover-')) {
    return jsonError(400, 'Invalid or missing logPath');
  }

  let content: string;
  try {
    content = await fs.readFile(logPath, 'utf8');
  } catch {
    return jsonOk({ done: false, content: '' });
  }

  if (!content.trim()) {
    return jsonOk({ done: false, content: '' });
  }

  let done = false;
  try {
    const stat = await fs.stat(logPath);
    done = Date.now() - stat.mtimeMs > 8_000;
  } catch { /* ignore */ }

  return jsonOk({ done, content });
}
