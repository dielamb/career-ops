import type { Application } from '@/lib/schemas';

const STATUS_CLASSES: Record<Application['status'], string> = {
  Evaluated: 'bg-chrome text-ink',
  Applied:   'bg-cyber text-ink',
  Responded: 'bg-acid text-ink',
  Interview: 'bg-ink text-acid',
  Offer:     'bg-acid text-ink border-magenta',
  Rejected:  'bg-transparent text-ink-dim line-through',
  Discarded: 'bg-transparent text-ink-dim',
  SKIP:      'bg-transparent text-ink-dim italic',
};

export interface StatusBadgeProps {
  status: Application['status'];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variantClasses = STATUS_CLASSES[status];
  return (
    <span
      data-testid="status-badge"
      data-status={status}
      className={`inline-block border-[1.5px] border-ink font-mono text-xs uppercase tracking-wider px-2 py-1 rounded-none ${variantClasses}`}
    >
      {status}
    </span>
  );
}
