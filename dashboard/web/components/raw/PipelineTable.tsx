import type { EnrichedPipelineEntry } from '@/lib/schemas';

export const APPLICATION_STATUSES = [
  'Evaluated', 'Applied', 'Responded', 'Interview', 'Offer', 'Rejected', 'Discarded',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface PipelineRowAction {
  id: string | null;
  entry: EnrichedPipelineEntry;
}

export interface StatusChangeAction {
  id: string;
  status: ApplicationStatus;
}

export type SortCol = 'company' | 'title' | 'score' | 'num' | 'firstSeen' | 'evalDate';
export type SortDir = 'asc' | 'desc';

export interface PipelineTableProps {
  rows: EnrichedPipelineEntry[];
  sortCol: SortCol;
  sortDir: SortDir;
  search: string;
  minScore: number;
  onSortChange: (col: SortCol) => void;
  onSearchChange: (term: string) => void;
  onMinScoreChange: (score: number) => void;
  onRowClick: (action: PipelineRowAction) => void;
  selectedId: string | null;
  onStatusChange?: (action: StatusChangeAction) => void;
  optimisticStatuses?: ReadonlyMap<string, ApplicationStatus>;
}

// Row background tint per state
const STATE_ROW_CLASS: Record<EnrichedPipelineEntry['state'], string> = {
  evaluated: 'bg-cyber/[0.04]',
  pending:   '',
  skipped:   'bg-ink/[0.03]',
  error:     'bg-magenta/[0.04]',
};

const STATE_COUNTS_LABEL: Record<EnrichedPipelineEntry['state'], string> = {
  evaluated: 'evaluated',
  pending:   'pending',
  skipped:   'skipped',
  error:     'error',
};

function deriveId(entry: EnrichedPipelineEntry): string | null {
  // Prefer Supabase row uuid (per-user, PipelineDetailModal handles it),
  // fall back to legacy MD numeric id (admin-only ListingModal handles it).
  if (entry.id != null) return entry.id;
  return entry.num != null ? String(entry.num) : null;
}

function ThSort({
  col, label, activeCol, sortDir, onSort, className = '',
}: {
  col: SortCol; label: string; activeCol: SortCol; sortDir: SortDir;
  onSort: (c: SortCol) => void; className?: string;
}) {
  const active = col === activeCol;
  return (
    <th
      className={`text-left p-sm font-mono text-xs uppercase cursor-pointer select-none hover:text-cyber ${className}`}
      onClick={() => onSort(col)}
    >
      {label}
      <span className={'ml-[3px]' + (active ? '' : ' opacity-30')}>
        {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </th>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  // YYYY-MM-DD → DD MMM YY
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
}

export function PipelineTable(props: PipelineTableProps) {
  const {
    rows, sortCol, sortDir, search, minScore,
    onSortChange, onSearchChange, onMinScoreChange,
    onRowClick, selectedId, onStatusChange, optimisticStatuses,
  } = props;

  const term = search.trim().toLowerCase();

  const counts = rows.reduce<Record<EnrichedPipelineEntry['state'], number>>(
    (acc, r) => { acc[r.state]++; return acc; },
    { pending: 0, evaluated: 0, skipped: 0, error: 0 },
  );

  const filtered = rows.filter((r) => {
    if (minScore > 0 && r.state === 'evaluated' && (r.score ?? 0) < minScore) return false;
    if (term) {
      const hay = `${r.company ?? ''} ${r.title ?? ''} ${r.appNotes ?? ''}`.toLowerCase();
      if (!hay.includes(term)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortCol === 'score')     cmp = (a.score ?? -1) - (b.score ?? -1);
    else if (sortCol === 'num')  cmp = (a.num ?? 0) - (b.num ?? 0);
    else if (sortCol === 'company')  cmp = (a.company ?? '').localeCompare(b.company ?? '');
    else if (sortCol === 'title')    cmp = (a.title ?? '').localeCompare(b.title ?? '');
    else if (sortCol === 'firstSeen') cmp = (a.firstSeen ?? '').localeCompare(b.firstSeen ?? '');
    else if (sortCol === 'evalDate')  cmp = (a.evalDate ?? '').localeCompare(b.evalDate ?? '');
    return sortDir === 'asc' ? cmp : -cmp;
  });

  return (
    <div data-testid="pipeline-table-root" className="flex flex-col gap-lg">

      {/* Header */}
      <header className="flex flex-col gap-xs">
        <h1 className="font-display text-4xl text-ink" style={{ fontVariationSettings: '"wdth" 60', fontWeight: 800 }}>
          Pipeline.
        </h1>
        <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">
          {(Object.entries(counts) as [EnrichedPipelineEntry['state'], number][])
            .filter(([, n]) => n > 0)
            .map(([s, n]) => `${n} ${STATE_COUNTS_LABEL[s]}`)
            .join(' · ')}
          {' '}·{' '}{sorted.length} shown
        </p>
      </header>

      {/* Search + score filter */}
      <div className="flex flex-wrap items-center gap-md">
        <input
          type="search"
          data-testid="pipeline-search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search company, role, or notes…"
          className="w-full max-w-[400px] px-md py-sm bg-paper border-[2.5px] border-ink font-body text-base rounded-none focus:outline-none focus:border-cyber"
        />
        <label className="flex items-center gap-sm font-mono text-xs uppercase text-ink-muted whitespace-nowrap">
          min score:{' '}
          <span data-testid="min-score-value" className="text-ink font-bold">{minScore.toFixed(1)}</span>
          <input
            type="range"
            data-testid="min-score-slider"
            min={0} max={5} step={0.1}
            value={minScore}
            onChange={(e) => onMinScoreChange(Number(e.target.value))}
            className="w-[140px] accent-magenta"
          />
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table
          data-testid="pipeline-table"
          className="w-full bg-paper border-[2.5px] border-ink shadow-[6px_6px_0_var(--color-ink)] rounded-none border-collapse"
        >
          <thead className="bg-ink text-bg">
            <tr>
              <ThSort col="company" label="Company / Title" activeCol={sortCol} sortDir={sortDir} onSort={onSortChange} />
              <ThSort col="score"   label="Score"  activeCol={sortCol} sortDir={sortDir} onSort={onSortChange} className="w-[5rem]" />
              <th className="text-left p-sm font-mono text-xs uppercase w-[9rem]">Status</th>
              <th className="text-left p-sm font-mono text-xs uppercase">Notes</th>
              <ThSort col="firstSeen" label="Found / Eval" activeCol={sortCol} sortDir={sortDir} onSort={onSortChange} className="w-[8rem]" />
              <th className="text-left p-sm font-mono text-xs uppercase w-[5rem]">JD</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} data-testid="pipeline-empty" className="p-md text-center font-body text-ink-muted">
                  {term ? 'No matches.' : 'Nothing here.'}
                </td>
              </tr>
            ) : sorted.map((r, idx) => {
              const id = deriveId(r);
              const isSelected = id != null && id === selectedId;
              const appStatus = id != null ? optimisticStatuses?.get(id) : undefined;
              const rowTint = STATE_ROW_CLASS[r.state];
              const isEvaluated = r.state === 'evaluated';
              const isSkippedOrError = r.state === 'skipped' || r.state === 'error';

              return (
                <tr
                  key={`${id ?? 'x'}-${idx}`}
                  data-testid={`pipeline-row-${id ?? idx}`}
                  data-id={id ?? ''}
                  data-state={r.state}
                  data-selected={isSelected ? 'true' : 'false'}
                  onClick={() => onRowClick({ id, entry: r })}
                  className={
                    'border-t border-ink-muted cursor-pointer hover:bg-cyber/[0.08] transition-colors ' +
                    rowTint + ' ' +
                    (isSelected ? 'outline outline-[2px] outline-cyber' : '')
                  }
                >
                  {/* Company + Title */}
                  <td className="p-sm">
                    <div className="font-body text-base font-semibold text-ink leading-tight">
                      {r.company ?? '(unknown)'}
                    </div>
                    <div className="font-body text-sm text-ink-soft leading-tight mt-[2px] line-clamp-1">
                      {r.title ?? ''}
                    </div>
                  </td>

                  {/* Score */}
                  <td className="p-sm">
                    {r.score != null ? (
                      <span className={
                        'font-mono text-xs font-bold px-[6px] py-[3px] border-[1.5px] border-ink ' +
                        (r.score >= 4.3 ? 'bg-acid text-ink' :
                         r.score >= 3.8 ? 'bg-cyber text-ink' :
                         'bg-paper text-ink-muted border-ink-muted')
                      }>
                        {r.score.toFixed(2)}
                      </span>
                    ) : <span className="text-ink-dim font-mono text-xs">—</span>}
                  </td>

                  {/* Status — evaluated only, else state tag */}
                  <td className="p-sm" onClick={(e) => e.stopPropagation()}>
                    {isEvaluated && id != null && onStatusChange ? (
                      <select
                        data-testid={`status-select-${id}`}
                        value={appStatus ?? ''}
                        onChange={(e) => {
                          if (e.target.value && id) {
                            onStatusChange({ id, status: e.target.value as ApplicationStatus });
                          }
                        }}
                        className="bg-paper border-[1.5px] border-ink-muted font-mono text-xs uppercase rounded-none px-xs py-[2px] focus:outline-none focus:border-cyber max-w-[130px]"
                      >
                        <option value="" disabled>— set —</option>
                        {APPLICATION_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={
                        'font-mono text-[10px] uppercase tracking-widest px-[5px] py-[2px] border ' +
                        (r.state === 'skipped' ? 'border-ink-muted text-ink-muted' :
                         r.state === 'error'   ? 'border-magenta text-magenta' :
                         'border-ink-dim text-ink-dim')
                      }>
                        {r.state}
                      </span>
                    )}
                  </td>

                  {/* Notes (evaluated) or Reason (skipped/error) */}
                  <td className="p-sm max-w-[320px]">
                    {isEvaluated && r.appNotes ? (
                      <span className="font-body text-sm text-ink-soft line-clamp-2" title={r.appNotes}>
                        {r.appNotes}
                      </span>
                    ) : isSkippedOrError && r.note ? (
                      <span className="font-mono text-xs text-ink-muted line-clamp-2" title={r.note}>
                        {r.note}
                      </span>
                    ) : (
                      <span className="text-ink-dim">—</span>
                    )}
                  </td>

                  {/* Found + Eval date */}
                  <td className="p-sm">
                    {r.firstSeen ? (
                      <div className="font-mono text-xs text-ink leading-tight">
                        {formatDate(r.firstSeen)}
                      </div>
                    ) : null}
                    {r.evalDate && r.evalDate !== r.firstSeen ? (
                      <div className="font-mono text-[10px] text-ink-muted leading-tight mt-[2px]">
                        eval {formatDate(r.evalDate)}
                      </div>
                    ) : null}
                    {!r.firstSeen && !r.evalDate && <span className="text-ink-dim font-mono text-xs">—</span>}
                  </td>

                  {/* [↗] external JD */}
                  <td className="p-sm" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs uppercase tracking-wider bg-ink text-bg px-sm py-xs border-[1.5px] border-ink hover:bg-cyber hover:text-ink whitespace-nowrap"
                    >
                      [↗]
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
