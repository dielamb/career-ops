import { spawn } from 'node:child_process';
import { openSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { jsonOk, jsonError } from '@/lib/api-helpers';
import { repoRoot } from '@/lib/api-paths';
import { validateUrl, InvalidUrlError } from '@/lib/spawn-mjs';

export const dynamic = 'force-dynamic';

const AddUrlBody = z.object({
  url: z.string().min(1),
});

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonError(400, 'Invalid JSON body');
  }

  const parsed = AddUrlBody.safeParse(raw);
  if (!parsed.success) {
    return jsonError(400, 'Invalid input', parsed.error.issues);
  }

  const { url } = parsed.data;

  try {
    validateUrl(url);
  } catch (err) {
    if (err instanceof InvalidUrlError) {
      return jsonError(400, err.message);
    }
    throw err;
  }

  const root = repoRoot();
  const ofertaPath = path.join(root, 'modes', 'oferta.md');
  const profilePath = path.join(root, 'modes', '_profile.md');
  const ts = Date.now();
  const logPath = `/tmp/eval-${ts}.md`;
  const logFd = openSync(logPath, 'w');

  // Prompt passes url as plain arg — no shell interpolation (array-form spawn).
  const prompt = `@${ofertaPath} @${profilePath} ${url}`;

  // Strip ANTHROPIC_API_KEY so `claude -p` uses subscription auth (Max).
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;

  const child = spawn('claude', ['-p', prompt], {
    cwd: root,
    detached: true,
    stdio: ['ignore', logFd, logFd],
    shell: false,
    env,
  });
  child.unref();

  return jsonOk({ ok: true, logPath, startedAt: new Date(ts).toISOString() }, { status: 202 });
}
