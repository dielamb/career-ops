'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PaletteEntry {
  id: string;
  label: string;
  sublabel: string;
  href: string;
}

function substringMatch(entries: PaletteEntry[], term: string): PaletteEntry[] {
  if (!term.trim()) return entries.slice(0, 20);
  const t = term.toLowerCase();
  return entries.filter(
    (e) => e.label.toLowerCase().includes(t) || e.sublabel.toLowerCase().includes(t),
  ).slice(0, 20);
}

/**
 * Global Cmd+K / Ctrl+K command palette.
 * Fetches applications + pipeline on open, provides fuzzy substring search.
 * Y2K aesthetic: full-screen ink overlay, centered card, IBM Plex Mono input.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<PaletteEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Global keydown: Cmd+K / Ctrl+K to open.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Fetch data when opened.
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setQuery('');
    setActiveIdx(0);

    Promise.all([
      fetch('/api/applications').then((r) => r.ok ? r.json() : { data: [] }),
      fetch('/api/pipeline').then((r) => r.ok ? r.json() : { data: [] }),
    ]).then(([apps, pipe]) => {
      const result: PaletteEntry[] = [];

      // Applications
      for (const a of (apps.data ?? []) as Array<{ num: number; company: string; role: string; status: string }>) {
        result.push({
          id: `app-${a.num}`,
          label: `${a.company} — ${a.role}`,
          sublabel: `#${a.num} · ${a.status}`,
          href: `/pipeline?id=${a.num}`,
        });
      }

      // Pipeline entries
      for (const p of (pipe.data ?? []) as Array<{ num: number | null; company: string | null; title: string | null; state: string }>) {
        if (!p.num) continue;
        result.push({
          id: `pipe-${p.num}`,
          label: `${p.company ?? '(no company)'} — ${p.title ?? '(no title)'}`,
          sublabel: `#${p.num} · ${p.state}`,
          href: `/pipeline?id=${p.num}`,
        });
      }

      setEntries(result);
    }).catch(() => {
      setEntries([]);
    }).finally(() => setLoading(false));
  }, [open]);

  // Focus input when opened.
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const filtered = substringMatch(entries, query);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      const entry = filtered[activeIdx];
      if (entry) navigate(entry.href);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-ink/60"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div
        className="w-full max-w-[600px] bg-paper border-[2.5px] border-ink shadow-[8px_8px_0_var(--color-ink)] rounded-none flex flex-col overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-sm px-md py-sm border-b-[2px] border-ink">
          <span className="font-mono text-xs text-ink-muted uppercase tracking-wider shrink-0">CMD+K</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
            placeholder="Search applications, pipeline…"
            className="flex-1 bg-transparent font-mono text-sm text-ink placeholder:text-ink-dim focus:outline-none"
          />
          {loading && (
            <span className="font-mono text-xs text-ink-muted">loading…</span>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="font-mono text-xs text-ink-muted hover:text-ink uppercase tracking-wider px-xs"
          >
            ESC
          </button>
        </div>

        {/* Results list */}
        <ul className="overflow-y-auto max-h-[400px]">
          {filtered.length === 0 && !loading && (
            <li className="px-md py-sm font-body text-sm text-ink-muted">
              No results for &ldquo;{query}&rdquo;
            </li>
          )}
          {filtered.map((entry, idx) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => navigate(entry.href)}
                data-active={idx === activeIdx ? 'true' : 'false'}
                className={
                  'w-full text-left px-md py-sm flex flex-col gap-[2px] border-b-[1px] border-ink-muted last:border-b-0 ' +
                  (idx === activeIdx ? 'bg-cyber-soft' : 'hover:bg-cyber-soft')
                }
              >
                <span className="font-body text-sm text-ink">{entry.label}</span>
                <span className="font-mono text-xs text-ink-muted">{entry.sublabel}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="px-md py-xs border-t-[1.5px] border-ink-muted flex gap-md">
          <span className="font-mono text-xs text-ink-dim">↑↓ navigate</span>
          <span className="font-mono text-xs text-ink-dim">↵ open</span>
          <span className="font-mono text-xs text-ink-dim">ESC close</span>
        </div>
      </div>
    </div>
  );
}
