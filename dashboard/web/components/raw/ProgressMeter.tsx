export type ProgressColor = 'cyber' | 'magenta' | 'acid' | 'ink';

export interface ProgressStat {
  label: string;
  value: number;
  color: ProgressColor;
}

export interface ProgressMeterProps {
  stats: ProgressStat[];
  total: number;
}

const COLOR_CLASSES: Record<ProgressColor, { text: string; bar: string }> = {
  cyber:   { text: 'text-ink',     bar: 'bg-cyber' },
  magenta: { text: 'text-magenta', bar: 'bg-magenta' },
  acid:    { text: 'text-ink',     bar: 'bg-acid' },
  ink:     { text: 'text-ink',     bar: 'bg-ink' },
};

export function ProgressMeter({ stats, total }: ProgressMeterProps) {
  const safeTotal = Math.max(1, total);
  const sum = stats.reduce((s, x) => s + x.value, 0);
  return (
    <section
      data-testid="progress-meter"
      className="bg-paper border-[2.5px] border-ink shadow-[6px_6px_0_var(--color-ink)] rounded-none p-xl"
    >
      <div className="grid grid-cols-4 gap-md mb-lg">
        {stats.map((stat) => {
          const c = COLOR_CLASSES[stat.color];
          return (
            <div key={stat.label} data-testid={`stat-${stat.label}`} className="flex flex-col">
              <span className={`font-display font-extrabold text-4xl ${c.text}`} style={{ fontVariationSettings: '"wdth" 60' }}>
                {stat.value}
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-ink-muted mt-xs">
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>
      <div
        data-testid="progress-meter-bar"
        role="progressbar"
        aria-valuenow={sum}
        aria-valuemin={0}
        aria-valuemax={total}
        className="flex w-full h-[14px] border-2 border-ink rounded-none overflow-hidden bg-paper"
      >
        {stats.map((stat) => {
          const pct = (stat.value / safeTotal) * 100;
          const c = COLOR_CLASSES[stat.color];
          return (
            <div
              key={stat.label}
              data-testid={`progress-segment-${stat.label}`}
              className={`h-full ${c.bar}`}
              style={{ width: `${pct}%` }}
            />
          );
        })}
      </div>
    </section>
  );
}
