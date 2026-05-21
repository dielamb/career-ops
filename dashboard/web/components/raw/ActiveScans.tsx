export interface ActiveScan {
  ts: number;
  path: string;
  sizeBytes: number;
  ageSec: number;
  staleSec: number;
  status: 'pending' | 'running' | 'done' | 'failed';
}

export interface ActiveScansProps {
  scans: ActiveScan[];
  onOpenLog: (path: string) => void;
}

const STATUS_CLASSES: Record<ActiveScan['status'], string> = {
  pending: 'bg-paper text-ink-soft animate-pulse',
  running: 'bg-cyber text-ink',
  done:    'bg-acid text-ink',
  failed:  'bg-magenta text-paper',
};

function formatAge(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '—';
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

export function ActiveScans({ scans, onOpenLog }: ActiveScansProps) {
  if (scans.length === 0) return null;

  const runningCount = scans.filter((s) => s.status === 'running' || s.status === 'pending').length;

  return (
    <section
      data-testid="active-scans"
      className="bg-paper border-[2.5px] border-ink shadow-[6px_6px_0_var(--color-ink)] rounded-none p-md"
    >
      <header className="flex items-baseline justify-between mb-md">
        <h2
          className="font-display font-extrabold text-xl text-ink"
          style={{ fontVariationSettings: '"wdth" 60' }}
        >
          // ACTIVE SCANS
          {runningCount > 0 && (
            <span className="ml-sm font-mono text-sm text-cyber">[{runningCount} running]</span>
          )}
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
          poll every 3s · last 1h
        </p>
      </header>
      <ul className="flex flex-col gap-sm">
        {scans.map((scan) => (
          <li
            key={scan.ts}
            data-testid={`scan-${scan.ts}`}
            data-status={scan.status}
            className="flex items-center gap-sm border-[1.5px] border-ink p-sm"
          >
            <span
              className={`font-mono text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border-[1.5px] border-ink ${STATUS_CLASSES[scan.status]}`}
            >
              {scan.status}
            </span>
            <span className="font-mono text-xs text-ink-muted">
              {new Date(scan.ts).toLocaleTimeString()}
            </span>
            <span className="font-mono text-xs text-ink-soft">
              age {formatAge(scan.ageSec)} · {formatSize(scan.sizeBytes)}
            </span>
            <button
              type="button"
              onClick={() => onOpenLog(scan.path)}
              className="ml-auto font-mono text-xs uppercase tracking-wider bg-ink text-bg px-sm py-xs border-[1.5px] border-ink hover:bg-cyber hover:text-ink"
            >
              [open log]
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
