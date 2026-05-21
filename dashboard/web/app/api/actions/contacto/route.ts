import { spawn } from 'node:child_process';
import { openSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { jsonOk, jsonError } from '@/lib/api-helpers';
import { repoRoot } from '@/lib/api-paths';

export const dynamic = 'force-dynamic';

const ContactoBody = z.object({
  company: z.string().min(1).max(200),
});

/** Sanitise string: reject if it contains shell-dangerous chars even though we use array-form spawn. */
function containsDangerousChars(s: string): boolean {
  return /[`$;|><&'"\\]/.test(s);
}

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonError(400, 'Invalid JSON body');
  }

  const parsed = ContactoBody.safeParse(raw);
  if (!parsed.success) {
    return jsonError(400, 'Invalid input', parsed.error.issues);
  }

  const { company } = parsed.data;
  if (containsDangerousChars(company)) {
    return jsonError(400, 'company contains invalid characters');
  }

  const root = repoRoot();
  const profilePath = path.join(root, 'modes', '_profile.md');
  const contactoPath = path.join(root, 'modes', 'contacto.md');
  const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  const logPath = `/tmp/contacto-${slug}-${Date.now()}.md`;

  const logFd = openSync(logPath, 'w');

  // claude -p "@modes/contacto.md company={company}"
  // Pass prompt as array args — no shell interpolation.
  const prompt = `@${contactoPath} @${profilePath} company=${company}`;

  // Strip ANTHROPIC_API_KEY so `claude -p` falls back to subscription auth (Max account).
  // ANTHROPIC_API_KEY in env makes claude CLI use API billing which fails for subscription users.
  // Equivalent to shell: `env -u ANTHROPIC_API_KEY claude -p "..."`
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

  return jsonOk({ ok: true, logPath, startedAt: new Date().toISOString() }, { status: 202 });
}
