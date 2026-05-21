import { promises as fs } from 'node:fs';
import { jsonOk, jsonError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/actions/scan/status?logPath=/tmp/career-ops-scan-{ts}.log
 *
 * Reads the log file written by scan.mjs. Returns:
 *   { done: boolean, lines: string[], newOffers: number | null }
 *
 * "done" heuristic: the last line of the log contains "Done" or "Error" or
 * the log has been idle (mtime > 10s old and non-empty).
 * newOffers parsed from line matching "N new offers" pattern.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const logPath = searchParams.get('logPath');

  if (!logPath || !logPath.startsWith('/tmp/career-ops-scan-')) {
    return jsonError(400, 'Invalid or missing logPath');
  }

  let content: string;
  try {
    content = await fs.readFile(logPath, 'utf8');
  } catch {
    // Not yet created — process may still be starting.
    return jsonOk({ done: false, lines: [], newOffers: null });
  }

  const lines = content.split('\n').filter(Boolean);
  const lastLine = lines[lines.length - 1] ?? '';

  // Done signals from scan.mjs output
  const doneSignals = ['Done.', 'done.', 'complete', 'Complete', 'Error', 'error', 'new offer'];
  const done = doneSignals.some((sig) => lastLine.includes(sig)) ||
    lines.some((l) => l.toLowerCase().includes('scan complete') || l.includes('new offer'));

  // Extract "N new offers" count
  let newOffers: number | null = null;
  for (const line of lines) {
    const m = line.match(/(\d+)\s+new\s+offer/i);
    if (m) { newOffers = parseInt(m[1], 10); break; }
  }

  // Also check mtime — if file hasn't grown in 10s and has content, treat as done.
  let mtimeDone = false;
  try {
    const stat = await fs.stat(logPath);
    const ageMs = Date.now() - stat.mtimeMs;
    if (lines.length > 0 && ageMs > 15_000) mtimeDone = true;
  } catch { /* ignore */ }

  return jsonOk({ done: done || mtimeDone, lines: lines.slice(-20), newOffers });
}
