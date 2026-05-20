import { z } from 'zod';
import { openInBrowse, InvalidUrlError } from '@/lib/spawn-mjs';
import { jsonOk, jsonError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

const ApplyBody = z.object({ url: z.string().min(1) });

export async function POST(req: Request) {
  // 1. Parse + validate body shape.
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonError(400, 'Invalid JSON body');
  }
  const parsed = ApplyBody.safeParse(raw);
  if (!parsed.success) {
    return jsonError(400, 'Invalid input', parsed.error.issues);
  }
  const { url } = parsed.data;

  // 2. Spawn browse (validateUrl runs inside openInBrowse).
  try {
    openInBrowse(url);
  } catch (err: unknown) {
    if (err instanceof InvalidUrlError) {
      return jsonError(400, 'Invalid URL', err.message);
    }
    // ENOENT on browse binary → 503 with hint.
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      return jsonError(503, 'Browse binary not found', 'Install gstack browse at the configured BROWSE_BIN path');
    }
    // Unknown spawn failure → 500.
    const msg = err instanceof Error ? err.message : String(err);
    return jsonError(500, 'Spawn failed', msg);
  }

  return jsonOk({ ok: true });
}
