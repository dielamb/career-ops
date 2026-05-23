'use client';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './Toast';

/**
 * [Run Scan] button — POSTs /api/scan/run, the M1 per-user scan that hits
 * Greenhouse/Ashby/Lever public APIs for every enabled company in
 * portals.yml and inserts matching listings into the caller's Supabase rows.
 *
 * Visible to all authenticated users. Synchronous (no polling): the API
 * returns a summary once done (typically <30s for ~50 companies).
 */
export function ScanButton() {
  const router = useRouter();
  const { showToast } = useToast();
  const [running, setRunning] = useState(false);

  const startScan = useCallback(async () => {
    if (running) return;
    setRunning(true);
    showToast('Scan started…', 'info');
    try {
      const res = await fetch('/api/scan/run', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}',
      });
      const data = (await res.json().catch(() => ({}))) as {
        added?: number;
        skipped_dup?: number;
        errors?: string[];
        error?: string;
      };
      if (!res.ok) {
        showToast(data.error ?? 'Scan failed', 'error');
        return;
      }
      const added = data.added ?? 0;
      showToast(
        `Scan complete: ${added} new offer${added === 1 ? '' : 's'} added`,
        'success',
      );
      router.refresh();
      window.dispatchEvent(new CustomEvent('careerops:scan-done', { detail: data }));
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Network error', 'error');
    } finally {
      setRunning(false);
    }
  }, [running, router, showToast]);

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
