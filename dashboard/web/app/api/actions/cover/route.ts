import { spawn } from 'node:child_process';
import { openSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { jsonOk, jsonError } from '@/lib/api-helpers';
import { repoRoot } from '@/lib/api-paths';

export const dynamic = 'force-dynamic';

const CoverBody = z.object({
  listingId: z.string().min(1).max(20).regex(/^[a-zA-Z0-9_-]+$/),
});

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonError(400, 'Invalid JSON body');
  }

  const parsed = CoverBody.safeParse(raw);
  if (!parsed.success) {
    return jsonError(400, 'Invalid input', parsed.error.issues);
  }

  const { listingId } = parsed.data;
  const root = repoRoot();
  const ofertaPath = path.join(root, 'modes', 'oferta.md');
  const profilePath = path.join(root, 'modes', '_profile.md');
  const logPath = `/tmp/cover-${listingId}-${Date.now()}.md`;
  const logFd = openSync(logPath, 'w');

  // Generate cover letter for a specific listing
  const prompt = `@${ofertaPath} @${profilePath} Generate a cover letter for listing #${listingId}. Focus on the cover letter only — not a full evaluation.`;

  const child = spawn('claude', ['-p', prompt], {
    cwd: root,
    detached: true,
    stdio: ['ignore', logFd, logFd],
    shell: false,
  });
  child.unref();

  return jsonOk({ ok: true, logPath, startedAt: new Date().toISOString() }, { status: 202 });
}
