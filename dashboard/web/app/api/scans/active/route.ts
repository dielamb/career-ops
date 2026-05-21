import { promises as fs } from 'node:fs';
import { jsonOk, jsonError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/scans/active?ts={timestamp}
 * Removes /tmp/eval-{ts}.md so the scan disappears from the widget.
 * Path traversal protected: ts must be all-digits.
 */
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const ts = searchParams.get('ts');
  if (!ts || !/^\d+$/.test(ts)) return jsonError(400, 'Invalid ts');
  const target = `/tmp/eval-${ts}.md`;
  try {
    await fs.unlink(target);
    return jsonOk({ ok: true, deleted: target });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return jsonOk({ ok: true, deleted: target, note: 'already gone' });
    }
    return jsonError(500, 'Failed to delete', { message: (err as Error).message });
  }
}

/**
 * GET /api/scans/active
 * Lists /tmp/eval-{ts}.md files from the last hour (recent add-url scans).
 * Each entry includes live size + age + heuristic status.
 *
 * Status heuristics:
 *   - running: file mtime < 30s ago AND size > 0
 *   - failed:  file is 0 bytes AND age > 10s
 *   - done:    file size > 0 AND no growth in last 30s (mtime > 30s ago)
 *   - pending: file 0 bytes AND age < 10s (just spawned, claude warming up)
 */

interface ActiveScan {
  ts: number;
  path: string;
  sizeBytes: number;
  ageSec: number;
  staleSec: number;
  status: 'pending' | 'running' | 'done' | 'failed';
}

const MAX_AGE_SEC = 60 * 60; // 1h window

export async function GET() {
  let entries: string[];
  try {
    entries = await fs.readdir('/tmp');
  } catch {
    return jsonOk({ scans: [] satisfies ActiveScan[] });
  }

  const now = Date.now();
  const out: ActiveScan[] = [];

  for (const name of entries) {
    const m = /^eval-(\d+)\.md$/.exec(name);
    if (!m) continue;
    const ts = Number(m[1]);
    const ageSec = Math.floor((now - ts) / 1000);
    if (ageSec > MAX_AGE_SEC || ageSec < 0) continue;

    const path = `/tmp/${name}`;
    let stat;
    try {
      stat = await fs.stat(path);
    } catch {
      continue;
    }
    const staleSec = Math.floor((now - stat.mtimeMs) / 1000);
    const sizeBytes = stat.size;

    let status: ActiveScan['status'];
    // claude CLI cold-start can take 60-90s before first byte hits the log
    // (subscription auth handshake + agent warmup). Only mark FAILED if still
    // empty after 5 minutes — most real scans complete in 2-3 min.
    if (sizeBytes === 0) {
      status = ageSec > 300 ? 'failed' : 'pending';
    } else if (staleSec < 30) {
      status = 'running';
    } else {
      status = 'done';
    }

    out.push({ ts, path, sizeBytes, ageSec, staleSec, status });
  }

  out.sort((a, b) => b.ts - a.ts);
  return jsonOk({ scans: out });
}
