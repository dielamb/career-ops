import type { Report } from '@/lib/schemas';
import { MarkdownProse } from '@/components/MarkdownProse';

export type ModalActionState = 'idle' | 'pending' | 'success' | 'locked' | 'error';
export type TabId = 'summary' | 'report' | 'contacts' | 'cover' | 'jd';

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
  contactoElapsedSec?: number;
  /** Cover letter action */
  coverState: ModalActionState;
  coverContent: string | null;
  coverElapsedSec?: number;
  /** Original job description content fetched from listing URL */
  jdContent?: string | null;
  jdError?: string | null;
  jdLoading?: boolean;
  /** Active tab (controlled from parent) */
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  /** Current application status from applications.md (shown as pill in header) */
  applicationStatus?: string | null;
  /** Handlers. */
  onOpenInChrome: () => void;
  onMarkApplied: () => void;
  onMarkDiscarded: () => void;
  onFindContacts: () => void;
  onGenerateCover: () => void;
  onClose: () => void;
}

function formatElapsed(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Returns badge character and color class for a tab */
function tabBadge(
  tab: TabId,
  contactoState: ModalActionState,
  contactoContent: string | null,
  contactoElapsedSec: number,
  coverState: ModalActionState,
  coverContent: string | null,
  coverElapsedSec: number,
): { badge: string; cls: string } {
  if (tab === 'contacts') {
    if (contactoContent) return { badge: '✓', cls: 'text-ink font-bold' };
    if (contactoState === 'pending') return { badge: `⏳ ${formatElapsed(contactoElapsedSec)}`, cls: 'text-cyber animate-pulse' };
    return { badge: '○', cls: 'text-ink-muted' };
  }
  if (tab === 'cover') {
    if (coverContent) return { badge: '✓', cls: 'text-ink font-bold' };
    if (coverState === 'pending') return { badge: `⏳ ${formatElapsed(coverElapsedSec)}`, cls: 'text-cyber animate-pulse' };
    return { badge: '○', cls: 'text-ink-muted' };
  }
  return { badge: '', cls: '' };
}

/** Score ≥4.5 → acid, 4.0-4.5 → ink, <4.0 → magenta */
function blockBorderColor(score: number): string {
  if (score >= 4.5) return 'border-acid';
  if (score >= 4.0) return 'border-ink';
  return 'border-magenta';
}

/** Extract the first ## section body text from markdown (for match analysis) */
function extractFirstSection(body: string): string | null {
  const lines = body.split('\n');
  let inSection = false;
  const out: string[] = [];
  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (inSection) break;
      inSection = true;
      continue;
    }
    if (inSection) out.push(line);
  }
  const text = out.join('\n').trim();
  return text || null;
}

/** Extract last ## Recommendation section (or last paragraph) */
function extractRecommendation(body: string): string | null {
  // Try to find a ## Recommendation section
  const recMatch = body.match(/##\s+Recommendation\n([\s\S]+?)(?=\n##|$)/i);
  if (recMatch) return recMatch[1].trim();
  // Fall back to last paragraph
  const paras = body.split(/\n\n+/).filter(p => p.trim());
  return paras.length > 0 ? paras[paras.length - 1].trim() : null;
}

export function ListingModal(props: ListingModalProps) {
  const {
    report, pdfHref, loading, loadError,
    applyState, applyMessage, markState, markMessage,
    contactoState, contactoContent, contactoElapsedSec = 0,
    coverState, coverContent, coverElapsedSec = 0,
    jdContent = null, jdError = null, jdLoading = false,
    activeTab, onTabChange,
    applicationStatus = null,
    onOpenInChrome, onMarkApplied, onMarkDiscarded,
    onFindContacts, onGenerateCover, onClose,
  } = props;

  const blockKeys = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

  function renderSummaryTab() {
    if (loading) {
      return <p className="font-body text-base text-ink-muted">Loading listing…</p>;
    }
    if (loadError) {
      return <p data-testid="modal-load-error" className="font-mono text-sm text-magenta">{loadError}</p>;
    }
    if (!report) return null;

    const firstSection = extractFirstSection(report.body);
    const recommendation = extractRecommendation(report.body);

    return (
      <div className="flex flex-col gap-md">
        {/* Legitimacy */}
        {report.legitimacy && (
          <div className="inline-flex items-center gap-xs px-sm py-xs border-[1.5px] border-ink font-mono text-xs uppercase tracking-wider text-ink-soft bg-chrome/30 self-start">
            {report.legitimacy}
          </div>
        )}

        {/* Block scores grid 2x3 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-xs">
          {blockKeys.map((k) => {
            const b = report.blocks[k];
            if (!b) return null;
            return (
              <div
                key={k}
                data-testid={`modal-block-${k}`}
                className={`border-[1.5px] ${blockBorderColor(b.score)} p-sm flex flex-col gap-xs`}
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">{k}</span>
                <span className="font-display text-2xl font-bold text-ink" style={{ fontVariationSettings: '"wdth" 60' }}>
                  {b.score.toFixed(1)}
                </span>
                <span className="font-body text-xs text-ink-soft line-clamp-3">{b.notes}</span>
              </div>
            );
          })}
        </div>

        {/* Match analysis — first ## section */}
        {firstSection && (
          <p className="font-body text-base text-ink-soft leading-relaxed">{firstSection}</p>
        )}

        {/* Recommendation card */}
        {recommendation && (
          <div className="border-[2px] border-ink p-md bg-paper shadow-[3px_3px_0_var(--color-ink)]">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-xs">// Recommendation</p>
            <MarkdownProse content={recommendation} />
          </div>
        )}
      </div>
    );
  }

  function renderReportTab() {
    if (loading) return <p className="font-body text-base text-ink-muted">Loading…</p>;
    if (loadError) return <p className="font-mono text-sm text-magenta">{loadError}</p>;
    if (!report) return null;
    return (
      <div data-testid="modal-body">
        <MarkdownProse content={report.body} />
      </div>
    );
  }

  function renderContactsTab() {
    if (contactoContent) {
      return (
        <div data-testid="modal-contacto-result" className="flex flex-col gap-md">
          <p className="font-mono text-xs uppercase tracking-wider text-cyber">
            // Contacts for {report?.title ?? '…'}
          </p>
          <MarkdownProse content={contactoContent} />
          <div className="border-t-[1.5px] border-ink-muted pt-md">
            <button
              type="button"
              onClick={onFindContacts}
              disabled={contactoState === 'pending'}
              className="bg-paper text-ink border-[2.5px] border-ink shadow-[3px_3px_0_var(--color-ink)] active:shadow-[1px_1px_0_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] font-mono text-sm uppercase tracking-wider px-md py-sm rounded-none disabled:opacity-50"
            >
              [Refresh]
            </button>
          </div>
        </div>
      );
    }
    if (contactoState === 'pending') {
      return (
        <div className="flex items-center gap-sm" data-testid="modal-contacto-pending">
          <span className="inline-block w-4 h-4 bg-cyber animate-pulse" aria-hidden="true" />
          <p className="font-mono text-sm text-cyber uppercase tracking-wider">
            // searching contacts… ({formatElapsed(contactoElapsedSec)})
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center gap-md py-lg text-center">
        <p className="font-mono text-sm text-ink-muted">No contacts fetched yet</p>
        <button
          type="button"
          data-testid="modal-action-find-contacts"
          onClick={onFindContacts}
          disabled={!report}
          className="bg-paper text-ink border-[2.5px] border-ink shadow-[3px_3px_0_var(--color-ink)] active:shadow-[1px_1px_0_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] font-mono text-sm uppercase tracking-wider px-md py-sm rounded-none disabled:opacity-50"
        >
          [Find Contacts]
        </button>
      </div>
    );
  }

  function renderCoverTab() {
    if (coverContent) {
      return (
        <div data-testid="modal-cover-result" className="flex flex-col gap-md">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-wider text-acid">
              // Cover Letter #{report?.num}
            </p>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(coverContent)}
              className="font-mono text-xs uppercase tracking-wider px-sm py-xs bg-acid text-ink border-[1.5px] border-ink shadow-[2px_2px_0_var(--color-ink)] rounded-none"
            >
              [Copy]
            </button>
          </div>
          <MarkdownProse content={coverContent} />
          <div className="border-t-[1.5px] border-ink-muted pt-md">
            <button
              type="button"
              onClick={onGenerateCover}
              disabled={coverState === 'pending'}
              className="bg-paper text-ink border-[2.5px] border-ink shadow-[3px_3px_0_var(--color-ink)] active:shadow-[1px_1px_0_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] font-mono text-sm uppercase tracking-wider px-md py-sm rounded-none disabled:opacity-50"
            >
              [Regenerate]
            </button>
          </div>
        </div>
      );
    }
    if (coverState === 'pending') {
      return (
        <div className="flex items-center gap-sm" data-testid="modal-cover-pending">
          <span className="inline-block w-4 h-4 bg-acid animate-pulse" aria-hidden="true" />
          <p className="font-mono text-sm text-ink-soft uppercase tracking-wider">
            // generating cover letter… ({formatElapsed(coverElapsedSec)})
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center gap-md py-lg text-center">
        <p className="font-mono text-sm text-ink-muted">No cover letter yet</p>
        <button
          type="button"
          data-testid="modal-action-cover"
          onClick={onGenerateCover}
          disabled={!report}
          className="bg-paper text-ink border-[2.5px] border-ink shadow-[3px_3px_0_var(--color-ink)] active:shadow-[1px_1px_0_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] font-mono text-sm uppercase tracking-wider px-md py-sm rounded-none disabled:opacity-50"
        >
          [Generate Cover Letter]
        </button>
      </div>
    );
  }

  function renderJdPane() {
    if (pdfHref) {
      return (
        <iframe
          data-testid="modal-pdf-iframe"
          src={pdfHref}
          title="Listing PDF"
          className="w-full h-full min-h-[480px] border-0"
        />
      );
    }
    if (jdLoading) {
      return (
        <div data-testid="modal-jd-loading" className="p-md font-mono text-sm text-ink-muted flex items-center gap-sm">
          <span className="inline-block w-3 h-3 bg-cyber animate-pulse" aria-hidden="true" />
          Fetching original posting…
        </div>
      );
    }
    if (jdContent) {
      return (
        <div data-testid="modal-jd-content" className="p-md overflow-y-auto font-body text-sm text-ink-soft whitespace-pre-wrap leading-relaxed">
          {jdContent}
        </div>
      );
    }
    if (report) {
      return (
        <div data-testid="modal-jd-missing" className="p-md overflow-y-auto">
          {jdError && (
            <p className="font-mono text-xs text-magenta mb-md">⚠ {jdError}</p>
          )}
          <p className="font-mono text-xs uppercase tracking-wider text-ink-muted mb-md">
            // Showing career-ops report body as fallback
          </p>
          <MarkdownProse content={report.body} />
        </div>
      );
    }
    return (
      <div data-testid="modal-pdf-missing" className="p-md font-mono text-sm text-ink-muted">
        Loading…
      </div>
    );
  }

  // Tabs shown on desktop (lg+): summary, report, contacts, cover
  // On mobile (<lg): also show 'jd' tab
  const desktopTabs: TabId[] = ['summary', 'report', 'contacts', 'cover'];
  const tabLabels: Record<TabId, string> = {
    summary: 'Summary',
    report: 'Report',
    contacts: 'Contacts',
    cover: 'Cover',
    jd: 'JD',
  };

  function renderTabButton(tab: TabId, showOnMobile: boolean) {
    const isActive = activeTab === tab;
    const { badge, cls: badgeCls } = tabBadge(tab, contactoState, contactoContent, contactoElapsedSec, coverState, coverContent, coverElapsedSec);
    return (
      <button
        key={tab}
        type="button"
        onClick={() => onTabChange(tab)}
        className={[
          'flex-1 px-md py-sm font-mono text-xs uppercase tracking-wider border-r-[1.5px] border-ink last:border-r-0 transition-colors',
          showOnMobile ? '' : 'hidden lg:block',
          isActive
            ? 'bg-acid text-ink font-bold'
            : 'bg-paper hover:bg-cyber',
        ].join(' ')}
        aria-selected={isActive}
      >
        {tabLabels[tab]}
        {badge && (
          <span className={`ml-xs ${badgeCls}`}>{badge}</span>
        )}
      </button>
    );
  }

  function renderActiveTab() {
    switch (activeTab) {
      case 'summary': return renderSummaryTab();
      case 'report': return renderReportTab();
      case 'contacts': return renderContactsTab();
      case 'cover': return renderCoverTab();
      case 'jd': return <div className="flex flex-col h-full">{renderJdPane()}</div>;
      default: return renderSummaryTab();
    }
  }

  const btnBase = 'border-[2.5px] border-ink shadow-[3px_3px_0_var(--color-ink)] active:shadow-[1px_1px_0_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] font-mono text-sm uppercase tracking-wider px-md py-sm rounded-none disabled:opacity-50';

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
        className="relative bg-paper border-[2.5px] border-ink shadow-[6px_6px_0_var(--color-ink)] rounded-none w-full max-w-[1200px] max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <header className="flex items-start justify-between p-md border-b-[2.5px] border-ink flex-shrink-0">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-muted flex items-center gap-sm flex-wrap">
              <span>// listing {report ? String(report.num).padStart(3, '0') : '...'}</span>
              {report && (
                <>
                  <span>&#183; &#9733;{report.score.toFixed(2)}</span>
                  <span>&#183; {report.date}</span>
                </>
              )}
              {applicationStatus && (
                <span
                  data-testid="modal-status-pill"
                  className={`px-2 py-0.5 border-[1.5px] border-ink font-bold tracking-widest text-[10px] ${
                    applicationStatus === 'Applied' ? 'bg-cyber text-ink' :
                    applicationStatus === 'Responded' ? 'bg-acid text-ink' :
                    applicationStatus === 'Interview' ? 'bg-ink text-acid' :
                    applicationStatus === 'Offer' ? 'bg-magenta text-paper' :
                    applicationStatus === 'Discarded' ? 'bg-chrome text-ink-muted line-through' :
                    applicationStatus === 'Rejected' ? 'bg-paper text-ink-dim line-through' :
                    'bg-paper text-ink-soft'
                  }`}
                >
                  {applicationStatus}
                </span>
              )}
            </p>
            <h2
              className="font-display text-3xl text-ink truncate"
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
            className="font-mono text-lg font-bold text-ink hover:text-magenta px-sm py-xs border-[1.5px] border-ink rounded-none bg-paper flex-shrink-0 ml-md"
          >
            &times;
          </button>
        </header>

        {/* Body — two columns on desktop */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[5fr_4fr] overflow-hidden min-h-0">

          {/* Left: Evaluation pane with tabs */}
          <section data-testid="modal-md-pane" className="flex flex-col border-r-[1.5px] border-ink-muted overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b-[1.5px] border-ink flex-shrink-0">
              {/* Desktop tabs: summary, report, contacts, cover */}
              {desktopTabs.map((tab) => renderTabButton(tab, true))}
              {/* Mobile-only JD tab */}
              <button
                type="button"
                onClick={() => onTabChange('jd')}
                className={[
                  'flex-1 px-md py-sm font-mono text-xs uppercase tracking-wider border-r-[1.5px] border-ink last:border-r-0 transition-colors lg:hidden',
                  activeTab === 'jd'
                    ? 'bg-acid text-ink font-bold'
                    : 'bg-paper hover:bg-cyber',
                ].join(' ')}
                aria-selected={activeTab === 'jd'}
              >
                JD
              </button>
            </div>

            {/* Tab label strip */}
            <div className="border-b-[1.5px] border-ink-muted px-md py-xs flex-shrink-0">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                // Evaluation
              </span>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-auto p-md">
              {renderActiveTab()}
            </div>
          </section>

          {/* Right: JD pane — desktop only */}
          <section data-testid="modal-pdf-pane" className="hidden lg:flex flex-col overflow-hidden">
            <div className="border-b-[1.5px] border-ink-muted p-sm font-mono text-xs uppercase tracking-wider text-ink-muted bg-paper flex-shrink-0">
              // Job Description
              {report?.url && (
                <a
                  href={report.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-sm text-cyber underline hover:bg-cyber hover:text-ink hover:no-underline"
                >
                  open original ↗
                </a>
              )}
            </div>
            <div className="flex-1 overflow-auto">
              {renderJdPane()}
            </div>
          </section>
        </div>

        {/* Footer action bar */}
        <footer className="flex flex-wrap items-center justify-between gap-md p-md border-t-[2.5px] border-ink flex-shrink-0 bg-paper">
          {/* Decide group */}
          <div className="flex items-center gap-sm flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted border-r-[1.5px] border-ink pr-sm mr-xs">
              // Decide
            </span>
            <button
              type="button"
              data-testid="modal-action-open"
              onClick={onOpenInChrome}
              disabled={!report || applyState === 'pending'}
              className={`bg-cyber text-ink ${btnBase}`}
            >
              [Open in Chrome]
            </button>
            <button
              type="button"
              data-testid="modal-action-mark-applied"
              onClick={onMarkApplied}
              disabled={!report || markState === 'pending'}
              className={`bg-acid text-ink ${btnBase}`}
            >
              [Mark Applied]
            </button>
            <button
              type="button"
              data-testid="modal-action-mark-discarded"
              onClick={onMarkDiscarded}
              disabled={!report || markState === 'pending'}
              className={`bg-paper text-ink ${btnBase} shadow-none`}
            >
              [Mark Discarded]
            </button>
            {/* Inline status messages */}
            {(applyState !== 'idle' || markState !== 'idle') && (
              <div data-testid="modal-action-status" className="font-mono text-xs">
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
          </div>

          {/* Research group */}
          <div className="flex items-center gap-sm flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted border-r-[1.5px] border-ink pr-sm mr-xs">
              // Research
            </span>
            <button
              type="button"
              data-testid="modal-action-find-contacts"
              onClick={onFindContacts}
              disabled={!report || contactoState === 'pending'}
              className={`bg-paper text-ink ${btnBase}`}
            >
              [Find Contacts]
            </button>
            <button
              type="button"
              data-testid="modal-action-cover"
              onClick={onGenerateCover}
              disabled={!report || coverState === 'pending'}
              className={`bg-paper text-ink ${btnBase}`}
            >
              [Cover Letter]
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
