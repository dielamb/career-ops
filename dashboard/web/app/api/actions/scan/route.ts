import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { jsonOk, jsonError } from '@/lib/api-helpers';
import { repoRoot } from '@/lib/api-paths';

export const dynamic = 'force-dynamic';

export async function POST() {
  const root = repoRoot();
  const scriptPath = path.join(root, 'scan.mjs');

  if (!existsSync(scriptPath)) {
    return jsonError(503, 'scan.mjs not found', { scriptPath });
  }

  const ts = Date.now();
  const logPath = `/tmp/career-ops-scan-${ts}.log`;

  // Spawn detached so it survives the request lifecycle.
  // stdio: pipe to log file via shell redirect is NOT safe (array-form required).
  // Instead we open the log file as stdout/stderr fd.
  const { openSync } = await import('node:fs');
  const logFd = openSync(logPath, 'w');

  const child = spawn('node', [scriptPath], {
    cwd: root,
    detached: true,
    stdio: ['ignore', logFd, logFd],
    shell: false,
  });
  child.unref();

  return jsonOk({ ok: true, logPath, startedAt: new Date(ts).toISOString() }, { status: 202 });
}
