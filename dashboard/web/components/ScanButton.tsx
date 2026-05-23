'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from './Toast';

/**
 * [Run Scan] button — POSTs /api/actions/scan, then polls /api/actions/scan/status
 * every 5s until done, showing toast notifications.
 *
 * Hidden for non-admin users: the scan worker still reads admin's portals.yml
 * from the local filesystem, so triggering it from a non-admin session would
 * just hit the middleware 403 (Beta feature — coming soon).
 */
export function ScanButton() {
  const { showToast } = useToast();
  const [running, setRunning] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/api/billing/status')
      .then((r) => r.json())
      .then((d: { isAdmin?: boolean }) => setIsAdmin(!!d.isAdmin))
      .catch(() => setIsAdmin(false));
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current != null) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const startScan = useCallback(async () => {
    if (running) return;
    setRunning(true);

    let logPath: string;
    try {
      const res = await fetch('/api/actions/scan', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        showToast((body as { error?: string }).error ?? 'Scan failed to start', 'error');
        setRunning(false);
        return;
      }
      const data = await res.json() as { logPath: string };
      logPath = data.logPath;
      showToast('Scan started (~1-2 min)', 'info');
      window.dispatchEvent(new CustomEvent('careerops:scan-started', { detail: { logPath } }));
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Network error', 'error');
      setRunning(false);
      return;
    }

    // Poll every 2s for responsive progress display
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/actions/scan/status?logPath=${encodeURIComponent(logPath)}`);
        if (!res.ok) return;
        const data = await res.json() as { done: boolean; newOffers: number | null };
        if (data.done) {
          stopPolling();
          setRunning(false);
          window.dispatchEvent(new CustomEvent('careerops:scan-done', { detail: { logPath } }));
          const count = data.newOffers;
          showToast(
            count != null ? `Scan complete: ${count} new offer${count !== 1 ? 's' : ''}` : 'Scan complete',
            'success',
          );
        }
      } catch { /* network blip — keep polling */ }
    }, 2000);
  }, [running, showToast, stopPolling]);

  if (isAdmin === false) return null;
  if (isAdmin === null) return null; // hide while loading to avoid flash

  return (
    <button
      type="button"
      onClick={startScan}
      disabled={running}
      data-testid="scan-button"
      className="bg-cyber text-ink border-[2.5px] border-ink shadow-[3px_3px_0_var(--color-ink)] font-mono text-xs uppercase tracking-wider px-md py-sm rounded-none disabled:opacity-50"
    >
      {running ? '[Scanning…]' : '[Run Scan]'}
    </button>
  );
}
