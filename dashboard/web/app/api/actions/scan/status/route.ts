import { promises as fs } from 'node:fs';
import { jsonOk, jsonError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export interface ScanProgressEntry {
  seq: number;
  total: number;
  company: string;
  status: 'scanning' | 'done' | 'error';
  found?: number;
  new?: number;
  err?: string;
}

export interface ScanStatusResponse {
  done: boolean;
  newOffers: number | null;
  progress: { completed: number; total: number } | null;
  current: string[];
  recent: ScanProgressEntry[];
  lines: string[];
}

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
    return jsonOk<ScanStatusResponse>({
      done: false, newOffers: null, progress: null, current: [], recent: [], lines: [],
    });
  }

  const lines = content.split('\n').filter(Boolean);
  const lastLine = lines[lines.length - 1] ?? '';

  // ── Parse structured progress lines ────────────────────────────────
  let total = 0;
  const inFlight = new Map<string, ScanProgressEntry>(); // company → entry
  const recent: ScanProgressEntry[] = [];

  for (const line of lines) {
    let m: RegExpMatchArray | null;

    m = line.match(/^\[SCAN_START\] total=(\d+)/);
    if (m) { total = parseInt(m[1], 10); continue; }

    m = line.match(/^\[SCAN_PROGRESS\] (\d+)\/(\d+) (.+)$/);
    if (m) {
      const entry: ScanProgressEntry = {
        seq: parseInt(m[1], 10),
        total: parseInt(m[2], 10),
        company: m[3].trim(),
        status: 'scanning',
      };
      if (!total) total = entry.total;
      inFlight.set(entry.company, entry);
      continue;
    }

    m = line.match(/^\[SCAN_DONE\] (\d+)\/(\d+) (.+) found=(\d+) new=(\d+)$/);
    if (m) {
      const company = m[3].trim();
      const entry: ScanProgressEntry = {
        seq: parseInt(m[1], 10),
        total: parseInt(m[2], 10),
        company,
        status: 'done',
        found: parseInt(m[4], 10),
        new: parseInt(m[5], 10),
      };
      inFlight.delete(company);
      recent.push(entry);
      continue;
    }

    m = line.match(/^\[SCAN_ERROR\] (\d+)\/(\d+) (.+) err=(.+)$/);
    if (m) {
      const company = m[3].trim();
      const entry: ScanProgressEntry = {
        seq: parseInt(m[1], 10),
        total: parseInt(m[2], 10),
        company,
        status: 'error',
        err: m[4],
      };
      inFlight.delete(company);
      recent.push(entry);
      continue;
    }
  }

  const completed = recent.length;
  const current = [...inFlight.keys()];

  // ── Done detection ──────────────────────────────────────────────────
  const doneSignals = ['New offers added:', '→ Run /career-ops pipeline'];
  const textDone = doneSignals.some(sig => lines.some(l => l.includes(sig)));
  const allDone = total > 0 && completed >= total;

  let mtimeDone = false;
  try {
    const stat = await fs.stat(logPath);
    if (lines.length > 0 && Date.now() - stat.mtimeMs > 15_000) mtimeDone = true;
  } catch { /* ignore */ }

  const done = textDone || allDone || mtimeDone;

  // ── newOffers from summary line ─────────────────────────────────────
  let newOffers: number | null = null;
  for (const line of lines) {
    const m2 = line.match(/New offers added:\s+(\d+)/);
    if (m2) { newOffers = parseInt(m2[1], 10); break; }
  }

  return jsonOk<ScanStatusResponse>({
    done,
    newOffers,
    progress: total > 0 ? { completed, total } : null,
    current,
    recent: recent.slice(-15),
    lines: lines.filter(l => !l.startsWith('[SCAN_')).slice(-10),
  });
}
