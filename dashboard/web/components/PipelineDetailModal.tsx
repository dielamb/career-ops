'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/motion-presets';

interface PipelineRow {
  id: string;
  url: string | null;
  company: string | null;
  title: string | null;
  score: number | null;
  dimension_scores: Record<string, number> | null;
  gap_analysis: string | null;
  notes: string | null;
  status: string;
  eval_date: string | null;
  created_at: string;
}

interface ListingRow {
  id: string;
  url: string;
  jd_text: string | null;
  company: string | null;
  title: string | null;
  source: string | null;
}

interface ApiResponse { pipeline: PipelineRow; listing: ListingRow | null }

interface Props { id: string; onClose: () => void }

const DIMENSION_LABELS: Record<string, string> = {
  A: 'Role fit',
  B: 'CV match',
  C: 'Level fit',
  D: 'Comp / market',
  E: 'Effort to apply',
  F: 'Interview odds',
};

export function PipelineDetailModal({ id, onClose }: Props) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);
    setLoadError(null);
    fetch(`/api/pipeline/${encodeURIComponent(id)}`)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setLoadError(`Failed to load (${res.status})`);
          return;
        }
        const body = await res.json() as ApiResponse;
        setData(body);
      })
      .catch((e) => { if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Network error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const pipeline = data?.pipeline;
  const listing = data?.listing;
  const dims = pipeline?.dimension_scores ?? null;

  return (
    <motion.div
      data-testid="motion-pipeline-detail-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={fadeUp.transition}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-md"
      onClick={onClose}
    >
      <div
        className="bg-paper border-[2.5px] border-ink shadow-[6px_6px_0_var(--color-ink)] w-full max-w-[760px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-md p-md border-b-[2px] border-ink bg-ink text-bg">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider opacity-70">// listing</p>
            <h2
              className="font-display font-extrabold text-3xl mt-xs leading-tight"
              style={{ fontVariationSettings: '"wdth" 60' }}
            >
              {pipeline?.company ?? listing?.company ?? '—'}
            </h2>
            <p className="font-body text-sm mt-[2px] opacity-90">
              {pipeline?.title ?? listing?.title ?? ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-xs uppercase tracking-wider bg-paper text-ink px-sm py-xs border-[2px] border-ink hover:bg-magenta hover:text-bg"
            aria-label="Close"
          >
            [esc]
          </button>
        </header>

        <div className="p-md flex flex-col gap-md">
          {loading && (
            <p className="font-mono text-sm text-ink-muted">Loading…</p>
          )}
          {loadError && (
            <div className="bg-magenta/15 border-[2px] border-magenta p-sm font-mono text-xs">
              {loadError}
            </div>
          )}

          {pipeline && (
            <>
              {/* Score + status row */}
              <div className="flex flex-wrap items-center gap-md">
                {pipeline.score != null && (
                  <div className="bg-acid border-[2.5px] border-ink shadow-[3px_3px_0_var(--color-ink)] px-md py-sm">
                    <p className="font-mono text-[10px] uppercase tracking-wider">// score</p>
                    <p className="font-display font-extrabold text-3xl text-ink leading-none mt-xs">
                      {pipeline.score.toFixed(2)}
                      <span className="font-body text-sm font-normal opacity-60">/5</span>
                    </p>
                  </div>
                )}
                <div className="font-mono text-xs">
                  <span className="text-ink-muted uppercase tracking-wider mr-xs">// status</span>
                  <span className="bg-paper border-[1.5px] border-ink px-sm py-[2px]">{pipeline.status}</span>
                </div>
                {pipeline.eval_date && (
                  <div className="font-mono text-xs text-ink-muted">
                    <span className="uppercase tracking-wider mr-xs">// eval</span>
                    {pipeline.eval_date}
                  </div>
                )}
              </div>

              {/* Summary */}
              {pipeline.notes && (
                <section>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-xs">// summary</p>
                  <p className="font-body text-sm text-ink leading-relaxed">{pipeline.notes}</p>
                </section>
              )}

              {/* Dimension scores */}
              {dims && Object.keys(dims).length > 0 && (
                <section>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-xs">// dimensions</p>
                  <div className="grid grid-cols-2 gap-xs">
                    {Object.entries(dims).map(([k, v]) => (
                      <div key={k} className="flex items-baseline justify-between border-b border-chrome py-xs">
                        <span className="font-body text-sm text-ink">{DIMENSION_LABELS[k] ?? k}</span>
                        <span className="font-mono text-sm font-semibold text-ink">{Number(v).toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Gap analysis */}
              {pipeline.gap_analysis && (
                <section>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-xs">// gaps</p>
                  <p className="font-body text-sm text-ink leading-relaxed whitespace-pre-line">
                    {pipeline.gap_analysis}
                  </p>
                </section>
              )}

              {/* JD text */}
              {listing?.jd_text && (
                <section>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-xs">// job description</p>
                  <pre className="font-body text-xs text-ink leading-relaxed whitespace-pre-wrap max-h-[260px] overflow-y-auto bg-bg border-[1.5px] border-chrome p-sm">
                    {listing.jd_text}
                  </pre>
                </section>
              )}

              {/* External link */}
              {pipeline.url && (
                <a
                  href={pipeline.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start bg-ink text-bg border-[2.5px] border-ink shadow-[3px_3px_0_var(--color-cyber)] font-mono text-xs uppercase tracking-wider px-md py-sm hover:bg-cyber hover:text-ink"
                >
                  [Open posting ↗]
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
