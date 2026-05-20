import type { Report } from '@/lib/schemas';

export type ModalActionState = 'idle' | 'pending' | 'success' | 'locked' | 'error';

export interface ListingModalProps {
  /** null while loading; Report once /api/listing/[id] resolves. */
  report: Report | null;
  /** href for PDF iframe; null shows the unavailable placeholder. */
  pdfHref: string | null;
  /** True while initial GET is in flight. */
  loading: boolean;
  /** 404 / network error message; non-null hides body and shows error block. */
  loadError: string | null;
  /** Per-action state for inline feedback. */
  applyState: ModalActionState;
  applyMessage: string | null;
  markState: ModalActionState;
  markMessage: string | null;
  /** Handlers. */
  onOpenInChrome: () => void;
  onMarkApplied: () => void;
  onMarkDiscarded: () => void;
  onClose: () => void;
}

export function ListingModal(props: ListingModalProps) {
  const {
    report, pdfHref, loading, loadError,
    applyState, applyMessage, markState, markMessage,
    onOpenInChrome, onMarkApplied, onMarkDiscarded, onClose,
  } = props;

  return (
    <div
      data-testid="listing-modal"
      role="dialog"
      aria-modal="true"
      aria-label={report ? `Listing ${report.num} ${report.title}` : 'Listing'}
      className="fixed inset-0 z-50 flex items-center justify-center p-md bg-ink/40"
      onClick={(e) => {
        // Outside click closes (only when target is the backdrop, not the content).
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        data-testid="listing-modal-content"
        className="relative bg-paper border-[2.5px] border-ink shadow-[6px_6px_0_var(--color-ink)] rounded-none w-full max-w-[1100px] max-h-[90vh] flex flex-col"
      >
        <header className="flex items-start justify-between p-md border-b-[2.5px] border-ink">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">
              // listing {report ? String(report.num).padStart(3, '0') : '...'}
            </p>
            <h2
              className="font-display text-3xl text-ink"
              style={{ fontVariationSettings: '"wdth" 60', fontWeight: 800 }}
            >
              {report?.title ?? (loading ? 'Loading…' : 'Listing')}
            </h2>
          </div>
          <button
            type="button"
            data-testid="modal-close"
            onClick={onClose}
            aria-label="Close listing"
            className="font-mono text-lg font-bold text-ink hover:text-magenta px-sm py-xs border-[1.5px] border-ink rounded-none bg-paper"
          >
            &times;
          </button>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-md p-md overflow-auto">
          <section data-testid="modal-md-pane" className="bg-paper border-[1.5px] border-ink-muted p-md overflow-auto">
            {loading && (
              <p className="font-body text-base text-ink-muted">Loading listing…</p>
            )}
            {loadError && !loading && (
              <p data-testid="modal-load-error" className="font-mono text-sm text-magenta">
                {loadError}
              </p>
            )}
            {report && !loading && !loadError && (
              <>
                <p className="font-mono text-xs uppercase tracking-wider text-ink-muted mb-sm">
                  // score {report.score.toFixed(2)} &middot; {report.date}
                </p>
                {report.legitimacy && (
                  <p className="font-body text-sm text-ink-soft mb-md">
                    <strong>Legitimacy:</strong> {report.legitimacy}
                  </p>
                )}
                <h3 className="font-display font-bold text-xl text-ink mt-md mb-sm">Blocks</h3>
                <ul className="flex flex-col gap-xs">
                  {(['A','B','C','D','E','F'] as const).map((k) => {
                    const b = report.blocks[k];
                    if (!b) return null;
                    return (
                      <li key={k} data-testid={`modal-block-${k}`} className="flex gap-sm border-b border-ink-muted py-xs">
                        <span className="font-mono text-sm font-bold text-ink w-6">{k}.</span>
                        <span className="font-mono text-sm text-ink-soft w-12">{b.score.toFixed(1)}</span>
                        <span className="font-body text-sm text-ink flex-1">{b.notes}</span>
                      </li>
                    );
                  })}
                </ul>
                <h3 className="font-display font-bold text-xl text-ink mt-lg mb-sm">Body</h3>
                <pre data-testid="modal-body" className="font-mono text-xs text-ink-soft whitespace-pre-wrap">
                  {report.body}
                </pre>
              </>
            )}
          </section>

          <section data-testid="modal-pdf-pane" className="bg-paper border-[1.5px] border-ink-muted overflow-hidden flex flex-col">
            {pdfHref ? (
              <iframe
                data-testid="modal-pdf-iframe"
                src={pdfHref}
                title="Listing PDF"
                className="w-full h-full min-h-[480px] border-0"
              />
            ) : (
              <div data-testid="modal-pdf-missing" className="p-md font-mono text-sm text-ink-muted">
                PDF unavailable for this listing.
              </div>
            )}
          </section>
        </div>

        <footer className="border-t-[2.5px] border-ink p-md flex flex-wrap items-center gap-sm">
          <button
            type="button"
            data-testid="modal-action-open"
            onClick={onOpenInChrome}
            disabled={!report || applyState === 'pending'}
            className="bg-cyber text-ink border-[2.5px] border-ink shadow-[3px_3px_0_var(--color-ink)] font-mono text-sm uppercase tracking-wider px-md py-sm rounded-none disabled:opacity-50"
          >
            [Open in Chrome]
          </button>
          <button
            type="button"
            data-testid="modal-action-mark-applied"
            onClick={onMarkApplied}
            disabled={!report || markState === 'pending'}
            className="bg-acid text-ink border-[2.5px] border-ink shadow-[3px_3px_0_var(--color-ink)] font-mono text-sm uppercase tracking-wider px-md py-sm rounded-none disabled:opacity-50"
          >
            [Mark Applied]
          </button>
          <button
            type="button"
            data-testid="modal-action-mark-discarded"
            onClick={onMarkDiscarded}
            disabled={!report || markState === 'pending'}
            className="bg-paper text-ink border-[2.5px] border-ink font-mono text-sm uppercase tracking-wider px-md py-sm rounded-none disabled:opacity-50"
          >
            [Mark Discarded]
          </button>

          {(applyState !== 'idle' || markState !== 'idle') && (
            <div data-testid="modal-action-status" className="ml-auto font-mono text-xs">
              {applyMessage && (
                <span
                  data-testid="modal-apply-message"
                  className={applyState === 'success' ? 'text-ink' : applyState === 'error' ? 'text-magenta' : 'text-ink-muted'}
                >
                  apply: {applyMessage}
                </span>
              )}
              {markMessage && (
                <span
                  data-testid="modal-mark-message"
                  className={
                    markState === 'success' ? 'text-ink ml-md'
                    : markState === 'locked' ? 'text-magenta ml-md'
                    : markState === 'error'  ? 'text-magenta ml-md'
                    : 'text-ink-muted ml-md'
                  }
                >
                  mark: {markMessage}
                </span>
              )}
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
