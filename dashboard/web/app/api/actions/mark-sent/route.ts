import { promises as fs } from 'node:fs';
import { z } from 'zod';
import { lockedWrite, LockedError } from '@/lib/git-commit';
import { applicationsPath } from '@/lib/api-paths';
import { jsonOk, jsonError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

const MarkSentBody = z.object({
  id: z.string().min(1),
  status: z.enum(['Evaluated', 'Applied', 'Responded', 'Interview', 'Offer', 'Rejected', 'Discarded']),
});

/**
 * Rewrites the status cell of the row whose first cell matches `id`.
 * Preserves all other rows exactly. Returns null if no match.
 */
function applyStatusUpdate(content: string, id: string, newStatus: string): string | null {
  const lines = content.split('\n');
  let updated = false;

  const out = lines.map((line) => {
    const trimmed = line.trim();
    // Skip non-table lines, header rows, separator rows.
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return line;
    if (trimmed.includes('| # |') || trimmed.includes('|---|')) return line;

    // Split cells preserving original spacing semantics. Drop empty leading/trailing.
    const cells = trimmed.split('|').slice(1, -1);
    if (cells.length < 9) return line;

    const numCell = cells[0].trim();
    if (numCell !== id) return line;

    // cells[5] = status cell. Preserve surrounding whitespace by replacing only inner trimmed text.
    cells[5] = ` ${newStatus} `;
    updated = true;
    return '|' + cells.join('|') + '|';
  });

  return updated ? out.join('\n') : null;
}

export async function POST(req: Request) {
  // 1. Parse + validate body.
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonError(400, 'Invalid JSON body');
  }
  const parsed = MarkSentBody.safeParse(raw);
  if (!parsed.success) {
    return jsonError(400, 'Invalid input', parsed.error.issues);
  }
  const { id, status } = parsed.data;

  // 2. Read current MD, apply update.
  const filePath = applicationsPath();
  let current: string;
  try {
    current = await fs.readFile(filePath, 'utf8');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return jsonError(500, 'Failed to read applications file', msg);
  }

  const next = applyStatusUpdate(current, id, status);
  if (next === null) {
    return jsonError(404, 'Application not found', { id });
  }

  // 3. Write with lock.
  try {
    await lockedWrite(filePath, next);
  } catch (err: unknown) {
    if (err instanceof LockedError) {
      return jsonError(423, 'Locked');
    }
    const msg = err instanceof Error ? err.message : String(err);
    return jsonError(500, 'Write failed', msg);
  }

  return jsonOk({
    ok: true,
    applied: { id, status, ts: new Date().toISOString() },
  });
}
