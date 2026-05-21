import type { Application, PipelineEntry, ParseError } from '@/lib/schemas';
import { ProgressMeter } from '@/components/ProgressMeter';
import { ListingCard } from '@/components/ListingCard';

export interface TodayHeroProps {
  applications: Application[];
  pipeline: PipelineEntry[];
  parseErrors: ParseError[];
  /** YYYY-MM-DD of "today" (server-supplied for deterministic SSR). */
  today: string;
  /** Called when user clicks [Open] on a Top 5 row. Receives pipeline entry num (1-based) as string. */
  onOpenTopFive?: (id: string) => void;
}

/** Application is overdue follow-up if status='Applied' and applied >= 7 days ago. */
function isOverdueFollowUp(app: Application, todayISO: string): boolean {
  if (app.status !== 'Applied') return false;
  const appliedTs = Date.parse(app.date);
  const todayTs = Date.parse(todayISO);
  if (Number.isNaN(appliedTs) || Number.isNaN(todayTs)) return false;
  const days = (todayTs - appliedTs) / (1000 * 60 * 60 * 24);
  return days >= 7;
}

/** Follow-ups today = Applied apps overdue OR Applied apps from exactly today.
 *  Overdue first. Returns up to 3 items. */
function deriveFollowUps(apps: Application[], today: string): Application[] {
  const followups = apps.filter(
    (a) => a.status === 'Applied' && (isOverdueFollowUp(a, today) || a.date === today),
  );
  followups.sort((a, b) => {
    const aOver = isOverdueFollowUp(a, today);
    const bOver = isOverdueFollowUp(b, today);
    if (aOver !== bOver) return aOver ? -1 : 1;
    return a.date < b.date ? -1 : 1;
  });
  return followups.slice(0, 3);
}

/** Top 5 to Apply: pipeline entries with score!=null, state in (evaluated|pending),
 *  sorted by score desc. */
function deriveTopFive(pipeline: PipelineEntry[]): PipelineEntry[] {
  return pipeline
    .filter((p) => p.score != null && (p.state === 'evaluated' || p.state === 'pending'))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 5);
}

export function TodayHero({ applications, pipeline, parseErrors, today, onOpenTopFive }: TodayHeroProps) {
  // Progress stats: Applied / Responded / Interview / Total-Remaining
  const applied   = applications.filter((a) => a.status === 'Applied').length;
  const responded = applications.filter((a) => a.status === 'Responded' || a.status === 'Interview' || a.status === 'Offer').length;
  const interview = applications.filter((a) => a.status === 'Interview' || a.status === 'Offer').length;
  const total = applications.filter((a) => a.status !== 'SKIP' && a.status !== 'Discarded').length;
  const stats = [
    { label: 'Applied',   value: applied,   color: 'cyber'   as const },
    { label: 'Responded', value: responded, color: 'acid'    as const },
    { label: 'Interview', value: interview, color: 'magenta' as const },
    { label: 'Total',     value: total,     color: 'ink'     as const },
  ];

  const followUps = deriveFollowUps(applications, today);
  const topFive   = deriveTopFive(pipeline);

  return (
    <div className="flex flex-col gap-2xl" data-testid="today-hero">
      {parseErrors.length > 0 && (
        <div
          role="alert"
          data-testid="parse-errors-banner"
          className="bg-magenta-soft border-[2.5px] border-magenta p-md rounded-none"
        >
          <p className="font-mono text-xs uppercase tracking-wider text-ink mb-xs">
            // {parseErrors.length} parse {parseErrors.length === 1 ? 'error' : 'errors'} skipped
          </p>
          <p className="font-body text-sm text-ink-soft">
            The dashboard rendered, but {parseErrors.length} row(s) failed validation and were skipped.
            Check data/applications.md and data/pipeline.md.
          </p>
        </div>
      )}

      <header>
        <p
          className="font-mono text-xs uppercase tracking-wider text-ink-muted mb-sm"
          data-testid="hero-section-label"
        >
          // Today
        </p>
        <h1
          data-testid="today-hero-heading"
          className="font-display text-5xl text-ink"
          style={{ fontVariationSettings: '"wdth" 60', fontWeight: 800 }}
        >
          Today.
        </h1>
      </header>

      <section data-testid="progress-section">
        <ProgressMeter stats={stats} total={Math.max(1, total)} />
      </section>

      <section data-testid="followups-section" className="flex flex-col gap-md">
        <h2 className="font-mono text-xs uppercase tracking-wider text-ink-muted">// Follow-ups Today</h2>
        {followUps.length === 0 ? (
          <p data-testid="followups-empty" className="font-body text-base text-ink-muted">
            No overdue follow-ups. Nice.
          </p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {followUps.map((app) => {
              const overdue = isOverdueFollowUp(app, today);
              return (
                <li
                  key={app.num}
                  data-testid={`followup-${app.num}`}
                  data-overdue={overdue ? 'true' : 'false'}
                  className={overdue ? 'border-l-[3px] border-magenta pl-sm' : ''}
                >
                  <ListingCard
                    company={app.company}
                    role={app.role}
                    score={app.score ?? 0}
                    status={app.status}
                    source={overdue ? 'OVERDUE' : undefined}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section data-testid="topfive-section" className="flex flex-col gap-md">
        <h2 className="font-mono text-xs uppercase tracking-wider text-ink-muted">// Top 5 to Apply</h2>
        {topFive.length === 0 ? (
          <p data-testid="topfive-empty" className="font-body text-base text-ink-muted">
            Pipeline empty. Run `scan` first.
          </p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {topFive.map((entry, idx) => (
              <li key={`${entry.num ?? 'x'}-${idx}`} data-testid={`topfive-${idx}`}>
                <ListingCard
                  company={entry.company ?? '(no company)'}
                  role={entry.title ?? '(no title)'}
                  score={entry.score ?? 0}
                  status="Evaluated"
                  source={new URL(entry.url).hostname.replace(/^www\./, '')}
                  onOpen={entry.num != null && onOpenTopFive ? () => onOpenTopFive(String(entry.num)) : undefined}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
