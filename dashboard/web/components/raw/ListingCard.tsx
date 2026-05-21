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
  const clickable = typeof onOpen === 'function';
  const Tag = clickable ? 'button' : 'article';
  const interactiveProps = clickable
    ? {
        type: 'button' as const,
        onClick: onOpen,
        'aria-label': `Open listing ${company} ${role}`,
      }
    : {};
  const interactiveClasses = clickable
    ? 'cursor-pointer text-left transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[8px_8px_0_var(--color-ink)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-cyber active:translate-x-[2px] active:translate-y-[2px] active:shadow-[3px_3px_0_var(--color-ink)]'
    : '';

  return (
    <Tag
      data-testid="listing-card"
      data-clickable={clickable ? 'true' : 'false'}
      className={`relative block w-full bg-paper border-[2.5px] border-ink shadow-[6px_6px_0_var(--color-ink)] rounded-none p-md ${interactiveClasses}`}
      {...interactiveProps}
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
    </Tag>
  );
}
