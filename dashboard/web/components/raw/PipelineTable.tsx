import type { PipelineEntry } from '@/lib/schemas';

export interface PipelineRowAction {
  /** id used by ListingModal — derived from row.num if available, else null. */
  id: string | null;
  entry: PipelineEntry;
}

export interface PipelineTableProps {
  rows: PipelineEntry[];
  /** Active state filter set; empty = all states allowed. */
  activeStates: ReadonlySet<PipelineEntry['state']>;
  /** Active source-hostname filter; empty = all hosts allowed. */
  activeSources: ReadonlySet<string>;
  /** Minimum score filter, 0..5. */
  minScore: number;
  /** Search term (case-insensitive substring). */
  search: string;
  /** All available source hostnames (for chip rendering). */
  allSources: ReadonlyArray<string>;
  onToggleState: (state: PipelineEntry['state']) => void;
  onToggleSource: (host: string) => void;
  onMinScoreChange: (score: number) => void;
  onSearchChange: (term: string) => void;
  onRowClick: (action: PipelineRowAction) => void;
  /** id of the row currently considered "selected" (for highlighting). */
  selectedId: string | null;
}

const STATE_ORDER: PipelineEntry['state'][] = ['evaluated', 'pending', 'skipped', 'error'];

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

function deriveId(entry: PipelineEntry): string | null {
  return entry.num != null ? String(entry.num) : null;
}

export function PipelineTable(props: PipelineTableProps) {
  const {
    rows, activeStates, activeSources, minScore, search,
    allSources, onToggleState, onToggleSource, onMinScoreChange, onSearchChange,
    onRowClick, selectedId,
  } = props;

  const term = search.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    if (activeStates.size > 0 && !activeStates.has(r.state)) return false;
    const host = hostnameOf(r.url);
    if (activeSources.size > 0 && !activeSources.has(host)) return false;
    if ((r.score ?? 0) < minScore) return false;
    if (term.length > 0) {
      const hay = `${r.company ?? ''} ${r.title ?? ''}`.toLowerCase();
      if (!hay.includes(term)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return (
    <div data-testid="pipeline-table-root" className="flex flex-col gap-lg">
      <header className="flex flex-col gap-md">
        <h1
          className="font-display text-4xl text-ink"
          style={{ fontVariationSettings: '"wdth" 60', fontWeight: 800 }}
        >
          Pipeline.
        </h1>
        <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">
          // {sorted.length} of {rows.length} candidates
        </p>
      </header>

      <section data-testid="filters" className="flex flex-col gap-sm">
        <input
          type="search"
          data-testid="pipeline-search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search company or role..."
          className="w-full max-w-[480px] px-md py-sm bg-paper border-[2.5px] border-ink font-body text-base rounded-none focus:outline-none focus:border-cyber"
        />

        <div data-testid="filter-state-chips" className="flex flex-wrap gap-xs">
          <span className="font-mono text-xs uppercase text-ink-muted self-center mr-sm">// state:</span>
          {STATE_ORDER.map((s) => {
            const active = activeStates.has(s);
            return (
              <button
                key={s}
                type="button"
                data-testid={`chip-state-${s}`}
                data-active={active ? 'true' : 'false'}
                onClick={() => onToggleState(s)}
                className={
                  active
                    ? 'px-sm py-xs bg-cyber text-ink border-[1.5px] border-ink font-mono text-xs uppercase tracking-wider rounded-none'
                    : 'px-sm py-xs bg-paper text-ink border-[1.5px] border-ink-muted font-mono text-xs uppercase tracking-wider rounded-none'
                }
              >
                {s}
              </button>
            );
          })}
        </div>

        <div data-testid="filter-source-chips" className="flex flex-wrap gap-xs">
          <span className="font-mono text-xs uppercase text-ink-muted self-center mr-sm">// source:</span>
          {allSources.map((host) => {
            const active = activeSources.has(host);
            return (
              <button
                key={host}
                type="button"
                data-testid={`chip-source-${host}`}
                data-active={active ? 'true' : 'false'}
                onClick={() => onToggleSource(host)}
                className={
                  active
                    ? 'px-sm py-xs bg-acid text-ink border-[1.5px] border-ink font-mono text-xs uppercase tracking-wider rounded-none'
                    : 'px-sm py-xs bg-paper text-ink border-[1.5px] border-ink-muted font-mono text-xs uppercase tracking-wider rounded-none'
                }
              >
                {host}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-sm font-mono text-xs uppercase text-ink-muted">
          // min score: <span data-testid="min-score-value">{minScore.toFixed(1)}</span>
          <input
            type="range"
            data-testid="min-score-slider"
            min={0}
            max={5}
            step={0.1}
            value={minScore}
            onChange={(e) => onMinScoreChange(Number(e.target.value))}
            className="w-[240px] accent-magenta"
          />
        </label>
      </section>

      <table
        data-testid="pipeline-table"
        className="w-full bg-paper border-[2.5px] border-ink shadow-[6px_6px_0_var(--color-ink)] rounded-none border-collapse"
      >
        <thead className="bg-ink text-bg">
          <tr>
            <th className="text-left p-sm font-mono text-xs uppercase">#</th>
            <th className="text-left p-sm font-mono text-xs uppercase">Company</th>
            <th className="text-left p-sm font-mono text-xs uppercase">Title</th>
            <th className="text-left p-sm font-mono text-xs uppercase">Score</th>
            <th className="text-left p-sm font-mono text-xs uppercase">State</th>
            <th className="text-left p-sm font-mono text-xs uppercase">Source</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={6} data-testid="pipeline-empty" className="p-md text-center font-body text-ink-muted">
                No candidates match the current filters.
              </td>
            </tr>
          ) : (
            sorted.map((r, idx) => {
              const id = deriveId(r);
              const isSelected = id != null && id === selectedId;
              const host = hostnameOf(r.url);
              return (
                <tr
                  key={`${id ?? 'x'}-${idx}`}
                  data-testid={`pipeline-row-${id ?? idx}`}
                  data-id={id ?? ''}
                  data-selected={isSelected ? 'true' : 'false'}
                  onClick={() => onRowClick({ id, entry: r })}
                  className={
                    'cursor-pointer border-t border-ink-muted hover:bg-cyber-soft ' +
                    (isSelected ? 'bg-acid-soft' : '')
                  }
                >
                  <td className="p-sm font-mono text-xs text-ink-muted">{r.num ?? '—'}</td>
                  <td className="p-sm font-body text-base text-ink">{r.company ?? '(no company)'}</td>
                  <td className="p-sm font-body text-base text-ink-soft">{r.title ?? '(no title)'}</td>
                  <td className="p-sm font-mono text-sm text-ink font-semibold">
                    {r.score != null ? r.score.toFixed(2) : '—'}
                  </td>
                  <td className="p-sm font-mono text-xs uppercase tracking-wider text-ink-muted">{r.state}</td>
                  <td className="p-sm font-mono text-xs text-ink-muted">{host}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
