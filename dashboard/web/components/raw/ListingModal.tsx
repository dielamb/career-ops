import type { Report } from '@/lib/schemas';
import { MarkdownProse } from '@/components/MarkdownProse';

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
  /** Contacto action */
  contactoState: ModalActionState;
  contactoContent: string | null;
  /** Cover letter action */
  coverState: ModalActionState;
  coverContent: string | null;
  /** Handlers. */
  onOpenInChrome: () => void;
  onMarkApplied: () => void;
  onMarkDiscarded: () => void;
  onFindContacts: () => void;
  onGenerateCover: () => void;
  onClose: () => void;
}

export function ListingModal(props: ListingModalProps) {
  const {
    report, pdfHref, loading, loadError,
    applyState, applyMessage, markState, markMessage,
    contactoState, contactoContent,
    coverState, coverContent,
    onOpenInChrome, onMarkApplied, onMarkDiscarded,
    onFindContacts, onGenerateCover, onClose,
  } = props;

  return (
    <div
      data-testid="listing-modal"
      role="dialog"
      aria-modal="true"
      aria-label={report ? `Listing ${report.num} ${report.title}` : 'Listing'}
      className="fixed inset-0 z-50 flex items-center justify-center p-md bg-ink/40"
      onClick={(e) => {
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
          <section data-testid="modal-md-pane" className="bg-paper border-[1.5px] border-ink-muted p-md overflow-auto flex flex-col gap-md">
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
                <div data-testid="modal-body">
                  <MarkdownProse content={report.body} />
                </div>
              </>
            )}

            {/* Contacto result */}
            {contactoContent && (
              <div data-testid="modal-contacto-result" className="border-t-[2px] border-cyber pt-md">
                <p className="font-mono text-xs uppercase tracking-wider text-cyber mb-sm">// Contacts</p>
                <MarkdownProse content={contactoContent} />
              </div>
            )}
            {contactoState === 'pending' && (
              <p className="font-mono text-xs text-ink-muted">// searching contacts…</p>
            )}

            {/* Cover letter result */}
            {coverContent && (
              <div data-testid="modal-cover-result" className="border-t-[2px] border-acid pt-md">
                <div className="flex items-center justify-between mb-sm">
                  <p className="font-mono text-xs uppercase tracking-wider text-acid">// Cover Letter</p>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(coverContent)}
                    className="font-mono text-xs uppercase tracking-wider px-sm py-xs bg-acid text-ink border-[1.5px] border-ink shadow-[2px_2px_0_var(--color-ink)] rounded-none"
                  >
                    [Copy]
                  </button>
                </div>
                <MarkdownProse content={coverContent} />
              </div>
            )}
            {coverState === 'pending' && (
              <p className="font-mono text-xs text-ink-muted">// generating cover letter…</p>
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
            ) : report ? (
              <div data-testid="modal-pdf-missing" className="p-md overflow-y-auto max-h-[80vh]">
                <p className="font-mono text-xs uppercase tracking-wider text-ink-muted mb-md">
                  // PDF unavailable — full report below
                </p>
                <MarkdownProse content={report.body} />
              </div>
            ) : (
              <div data-testid="modal-pdf-missing" className="p-md font-mono text-sm text-ink-muted">
                Loading…
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
          <button
            type="button"
            data-testid="modal-action-find-contacts"
            onClick={onFindContacts}
            disabled={!report || contactoState === 'pending'}
            className="bg-magenta text-ink border-[2.5px] border-ink shadow-[3px_3px_0_var(--color-ink)] font-mono text-sm uppercase tracking-wider px-md py-sm rounded-none disabled:opacity-50"
          >
            [Find Contacts]
          </button>
          <button
            type="button"
            data-testid="modal-action-cover"
            onClick={onGenerateCover}
            disabled={!report || coverState === 'pending'}
            className="bg-paper text-ink border-[2.5px] border-ink shadow-[3px_3px_0_var(--color-ink)] font-mono text-sm uppercase tracking-wider px-md py-sm rounded-none disabled:opacity-50"
          >
            [Cover Letter]
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
