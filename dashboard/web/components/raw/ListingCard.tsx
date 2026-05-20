import type { Application } from '@/lib/schemas';
import { StatusBadge } from './StatusBadge';
import { ScoreBar } from './ScoreBar';

export interface ListingCardProps {
  company: string;
  role: string;
  score: number;
  status: Application['status'];
  source?: string;
  onOpen?: () => void;
}

export function ListingCard({ company, role, score, status, source, onOpen }: ListingCardProps) {
  return (
    <article
      data-testid="listing-card"
      className="relative bg-paper border-[2.5px] border-ink shadow-[6px_6px_0_var(--color-ink)] rounded-none p-md"
    >
      <div className="absolute top-2 right-2 bg-acid text-ink font-display font-bold text-xl px-2 py-1 border-[1.5px] border-ink rounded-none">
        {score.toFixed(2)}
      </div>
      <h3 data-testid="listing-company" className="font-display font-bold text-2xl text-ink pr-16">
        {company}
      </h3>
      <p data-testid="listing-role" className="font-body text-base text-ink-soft mt-1">
        {role}
      </p>
      <div className="mt-md">
        <ScoreBar score={score} max={5} />
      </div>
      <div className="flex items-center gap-sm mt-md flex-wrap">
        <StatusBadge status={status} />
        {source && (
          <span data-testid="listing-source" className="font-mono text-xs text-ink-muted uppercase tracking-wider border-[1.5px] border-ink-muted px-2 py-1 rounded-none">
            {source}
          </span>
        )}
      </div>
      <button
        type="button"
        data-testid="listing-open"
        onClick={onOpen}
        className="mt-md bg-ink text-bg font-mono text-sm uppercase tracking-wider px-md py-sm rounded-none border-[1.5px] border-ink hover:bg-cyber hover:text-ink"
      >
        [Open]
      </button>
    </article>
  );
}
