'use client';
import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActiveScans as RawActiveScans, type ActiveScan } from './raw/ActiveScans';
import { fadeUp } from '@/lib/motion-presets';

const POLL_MS = 3000;

export function ActiveScans() {
  const [scans, setScans] = useState<ActiveScan[]>([]);
  const [openLogPath, setOpenLogPath] = useState<string | null>(null);
  const [logContent, setLogContent] = useState<string>('');
  const [logLoading, setLogLoading] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/scans/active', { cache: 'no-store' });
      if (!res.ok) return;
      const body = await res.json() as { scans: ActiveScan[] };
      setScans(body.scans);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

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

  const handleCloseLog = useCallback(() => {
    setOpenLogPath(null);
    setLogContent('');
  }, []);

  // ESC closes log modal
  useEffect(() => {
    if (!openLogPath) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCloseLog(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openLogPath, handleCloseLog]);

  if (scans.length === 0) return null;

  return (
    <>
      <motion.div
        data-testid="motion-active-scans"
        initial={fadeUp.initial}
        animate={fadeUp.animate}
        transition={fadeUp.transition}
      >
        <RawActiveScans scans={scans} onOpenLog={handleOpenLog} />
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
