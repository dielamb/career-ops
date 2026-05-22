'use client';
import { useState } from 'react';
import { useToast } from './Toast';

/**
 * Quick-add URL widget: validates URL client-side, POSTs /api/actions/add-url,
 * shows toast on success. Mounts inside the Sidebar below nav items.
 */
export function AddUrlWidget() {
  const { showToast } = useToast();
  const [url, setUrl] = useState('');
  const [pending, setPending] = useState(false);

  const isValidUrl = (s: string) => {
    try {
      const u = new URL(s);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch { return false; }
  };

  const handleAdd = async () => {
    if (!isValidUrl(url) || pending) return;
    setPending(true);
    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const body = await res.json().catch(() => ({})) as Record<string, unknown>;
      if (res.ok) {
        const score = typeof body.score === 'number' ? ` — score ${body.score}/5` : '';
        const company = typeof body.company === 'string' ? ` (${body.company})` : '';
        showToast(`Evaluated${company}${score}. Check /pipeline.`, 'success');
        setUrl('');
      } else {
        showToast((body as { error?: string }).error ?? 'Failed to evaluate URL', 'error');
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Network error', 'error');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mt-auto pt-lg border-t-[1.5px] border-ink-muted flex flex-col gap-sm">
      <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">// Add URL</p>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
        placeholder="https://..."
        disabled={pending}
        className="w-full px-sm py-xs bg-paper border-[1.5px] border-ink font-mono text-xs rounded-none focus:outline-none focus:border-cyber disabled:opacity-50"
      />
      <button
        type="button"
        onClick={handleAdd}
        disabled={pending || !isValidUrl(url)}
        className="bg-acid text-ink border-[2.5px] border-ink shadow-[3px_3px_0_var(--color-ink)] font-mono text-xs uppercase tracking-wider px-md py-sm rounded-none disabled:opacity-50"
      >
        {pending ? '[Adding…]' : '[+ Add URL]'}
      </button>
    </div>
  );
}
