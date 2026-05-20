export interface ScoreBarProps {
  score: number;
  max?: number;
}

export function ScoreBar({ score, max = 5 }: ScoreBarProps) {
  const clamped = Math.max(0, Math.min(score, max));
  const pct = (clamped / max) * 100;
  return (
    <div
      data-testid="score-bar"
      data-score={clamped}
      data-max={max}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={max}
      className="w-full h-[14px] border-2 border-ink bg-paper rounded-none overflow-hidden"
    >
      <div
        data-testid="score-bar-fill"
        className="h-full bg-acid"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
