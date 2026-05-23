'use client';
import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActiveScans as RawActiveScans, type ActiveScan } from './raw/ActiveScans';
import { fadeUp } from '@/lib/motion-presets';
import type { ScanStatusResponse } from '@/app/api/actions/scan/status/route';

const POLL_MS = 2000;
const SCAN_STARTED_EVENT = 'careerops:scan-started';

export function ActiveScans() {
  const [scans, setScans] = useState<ActiveScan[]>([]);
  const [openLogPath, setOpenLogPath] = useState<string | null>(null);
  const [logContent, setLogContent] = useState<string>('');
  const [logLoading, setLogLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  // ActiveScans polls /api/scans/active + /api/file, both blocked for non-admin
  // users. Skip the whole component until the per-user scan flow lands.
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Scan.mjs run progress
  const [scanLogPath, setScanLogPath] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatusResponse | null>(null);

  useEffect(() => {
    fetch('/api/billing/status')
      .then((r) => r.json())
      .then((d: { isAdmin?: boolean }) => setIsAdmin(!!d.isAdmin))
      .catch(() => setIsAdmin(false));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/scans/active', { cache: 'no-store' });
      if (!res.ok) return;
      const body = await res.json() as { scans: ActiveScan[] };
      setScans(body.scans);
    } catch { /* ignore */ }
  }, []);

  const pollScanStatus = useCallback(async (path: string) => {
    try {
      const res = await fetch(`/api/actions/scan/status?logPath=${encodeURIComponent(path)}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json() as ScanStatusResponse;
      setScanStatus(data);
      if (data.done) {
        setScanLogPath(null);
        // Sync pipeline.md → Supabase so new offers appear in the dashboard
        fetch('/api/pipeline/sync', { method: 'POST' }).catch(() => null);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!isAdmin) { setMounted(true); return; }
    setMounted(true);
    refresh();
    const id = setInterval(refresh, POLL_MS);
    const onScanStarted = () => { refresh(); };
    window.addEventListener(SCAN_STARTED_EVENT, onScanStarted);
    return () => {
      clearInterval(id);
      window.removeEventListener(SCAN_STARTED_EVENT, onScanStarted);
    };
  }, [refresh, isAdmin]);

  // Listen for scan.mjs run start
  useEffect(() => {
    const onStart = (e: Event) => {
      const { logPath } = (e as CustomEvent<{ logPath: string }>).detail;
      setScanLogPath(logPath);
      setScanStatus(null);
    };
    window.addEventListener('careerops:scan-started', onStart);
    return () => window.removeEventListener('careerops:scan-started', onStart);
  }, []);

  // Poll scan.mjs status every 2s while running
  useEffect(() => {
    if (!scanLogPath) return;
    pollScanStatus(scanLogPath);
    const id = setInterval(() => pollScanStatus(scanLogPath), POLL_MS);
    return () => clearInterval(id);
  }, [scanLogPath, pollScanStatus]);

  const handleOpenLog = useCallback(async (path: string) => {
    setOpenLogPath(path);
    setLogLoading(true);
    setLogContent('');
    try {
      const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`, { cache: 'no-store' });
      if (res.ok) {
        setLogContent(await res.text());
      } else {
        setLogContent(`[error] HTTP ${res.status}`);
      }
    } catch (e) {
      setLogContent(`[error] ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLogLoading(false);
    }
  }, []);

  const handleDismiss = useCallback(async (ts: number) => {
    setScans((prev) => prev.filter((s) => s.ts !== ts));
    try {
      await fetch(`/api/scans/active?ts=${ts}`, { method: 'DELETE' });
    } catch { /* ignore */ }
  }, []);

  const handleCloseLog = useCallback(() => {
    setOpenLogPath(null);
    setLogContent('');
  }, []);

  useEffect(() => {
    if (!openLogPath) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCloseLog(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openLogPath, handleCloseLog]);

  if (!mounted) return null;
  if (isAdmin === false || isAdmin === null) return null;

  // Build scan progress node to inject into the raw widget
  const scanProgress = (scanStatus || scanLogPath) ? buildScanProgressNode(scanStatus) : undefined;

  return (
    <>
      <motion.div
        data-testid="motion-active-scans"
        initial={fadeUp.initial}
        animate={fadeUp.animate}
        transition={fadeUp.transition}
      >
        <RawActiveScans
          scans={scans}
          onOpenLog={handleOpenLog}
          onDismiss={handleDismiss}
          showWhenEmpty
          scanProgress={scanProgress}
        />
      </motion.div>

      <AnimatePresence>
        {openLogPath && (
          <motion.div
            data-testid="scan-log-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center p-lg"
            onClick={handleCloseLog}
          >
            <div
              className="bg-paper border-[2.5px] border-ink shadow-[6px_6px_0_var(--color-ink)] max-w-3xl w-full max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="flex items-center justify-between p-md border-b-[2.5px] border-ink">
                <p className="font-mono text-xs uppercase tracking-wider text-ink-muted truncate">
                  {openLogPath}
                </p>
                <button
                  type="button"
                  onClick={handleCloseLog}
                  aria-label="Close log"
                  className="font-mono text-lg font-bold text-ink hover:text-magenta px-sm py-xs border-[1.5px] border-ink rounded-none bg-paper"
                >
                  &times;
                </button>
              </header>
              <pre
                data-testid="scan-log-content"
                className="flex-1 overflow-auto p-md font-mono text-xs text-ink-soft whitespace-pre-wrap break-words"
              >
                {logLoading ? 'Loading…' : (logContent || '[empty — claude has not written yet or scan failed]')}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function buildScanProgressNode(status: ScanStatusResponse | null): React.ReactNode {
  const prog = status?.progress;
  const pct = prog ? Math.round((prog.completed / prog.total) * 100) : 0;
  const current = status?.current ?? [];
  const newOffers = status?.recent?.filter(r => (r.new ?? 0) > 0) ?? [];
  const done = status?.done ?? false;

  return (
    <div
      data-testid="scan-run-progress"
      className="border-[1.5px] border-cyber bg-paper p-sm mb-md flex flex-col gap-sm"
    >
      {/* Status line */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wider text-cyber">
          {done ? '[scan complete]' : '[scanning portals…]'}
        </span>
        {prog && (
          <span className="font-mono text-xs text-ink-muted">
            {prog.completed}/{prog.total} companies
          </span>
        )}
      </div>

      {/* Progress bar */}
      {prog && (
        <div className="w-full h-[6px] border border-ink-muted bg-paper overflow-hidden">
          <div
            className="h-full bg-cyber transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* Currently in-flight companies */}
      {!done && current.length > 0 && (
        <p className="font-mono text-[11px] text-ink-muted truncate">
          scanning: {current.slice(0, 4).join(', ')}{current.length > 4 ? ` +${current.length - 4}` : ''}
        </p>
      )}

      {/* Recent companies with new offers */}
      {newOffers.length > 0 && (
        <ul className="flex flex-col gap-[2px] max-h-[96px] overflow-y-auto">
          {newOffers.map((entry) => (
            <li key={`${entry.company}-${entry.seq}`} className="flex items-center gap-sm font-mono text-[11px]">
              <span className="font-bold text-ink bg-acid px-[4px]">+{entry.new}</span>
              <span className="text-ink truncate">{entry.company}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Done summary */}
      {done && (
        <p className="font-mono text-xs font-bold text-ink">
          {status?.newOffers != null
            ? `${status.newOffers} new offer${status.newOffers !== 1 ? 's' : ''} added to pipeline`
            : 'Scan complete — check pipeline'}
        </p>
      )}
    </div>
  );
}
