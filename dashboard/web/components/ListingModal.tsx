'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ListingModal as RawListingModal, type ModalActionState, type TabId } from './raw/ListingModal';
import type { Report } from '@/lib/schemas';
import { fadeUp } from '@/lib/motion-presets';

export interface ListingModalClientProps {
  id: string;
  onClose: () => void;
  /** Optional callback after successful Mark Applied. Parent can refresh data. */
  onAfterApplied?: () => void;
}

interface LoadedListing { report: Report; pdfPath: string | null; }

function usePollAction(startedLogPath: string | null, prefix: string) {
  const [state, setState] = useState<ModalActionState>('idle');
  const [content, setContent] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (pollRef.current != null) { clearInterval(pollRef.current); pollRef.current = null; }
    if (tickRef.current != null) { clearInterval(tickRef.current); tickRef.current = null; }
  }, []);

  useEffect(() => {
    if (!startedLogPath) return;
    setState('pending');
    setContent(null);
    setElapsedSec(0);
    const startTs = Date.now();
    // Tick every 1s for elapsed counter UI
    tickRef.current = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startTs) / 1000));
    }, 1000);
    // Poll status every 3s
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${prefix}?logPath=${encodeURIComponent(startedLogPath)}`);
        if (!res.ok) return;
        const data = await res.json() as { done: boolean; content: string };
        if (data.done) {
          stop();
          setState('success');
          setContent(data.content || null);
        }
      } catch { /* blip */ }
    }, 3000);
    return stop;
  }, [startedLogPath, prefix, stop]);

  return { state, content, elapsedSec };
}

export function ListingModal({ id, onClose, onAfterApplied }: ListingModalClientProps) {
  const router = useRouter();
  const [loading, setLoading]     = useState(true);
  const [listing, setListing]     = useState<LoadedListing | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [applyState, setApplyState]     = useState<ModalActionState>('idle');
  const [applyMessage, setApplyMessage] = useState<string | null>(null);
  const [markState,  setMarkState]      = useState<ModalActionState>('idle');
  const [markMessage, setMarkMessage]   = useState<string | null>(null);

  const [contactoLogPath, setContactoLogPath] = useState<string | null>(null);
  const [coverLogPath, setCoverLogPath]       = useState<string | null>(null);
  const [cachedContactoContent, setCachedContactoContent] = useState<string | null>(null);
  const [cachedCoverContent, setCachedCoverContent]       = useState<string | null>(null);
  const [jdContent, setJdContent] = useState<string | null>(null);
  const [jdError, setJdError]     = useState<string | null>(null);
  const [jdLoading, setJdLoading] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  const { state: contactoState, content: contactoFreshContent, elapsedSec: contactoElapsed } =
    usePollAction(contactoLogPath, '/api/actions/contacto/status');
  const { state: coverState, content: coverFreshContent, elapsedSec: coverElapsed } =
    usePollAction(coverLogPath, '/api/actions/cover/status');

  // Effective content: fresh poll result OR cached lookup from previous session
  const contactoContent = contactoFreshContent ?? cachedContactoContent;
  const coverContent    = coverFreshContent ?? cachedCoverContent;

  // GET /api/listing/[id] on mount + id change.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setListing(null);
    setLoadError(null);

    fetch(`/api/listing/${encodeURIComponent(id)}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) { setLoadError('Listing not found'); return; }
        if (!res.ok) { setLoadError(`Failed to load listing (${res.status})`); return; }
        const body = await res.json();
        setListing({ report: body.report, pdfPath: body.pdfPath ?? null });
      })
      .catch((e) => { if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Network error'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  // ESC closes.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Fetch current application status (from applications.md) for the header pill.
  useEffect(() => {
    if (!listing) return;
    let cancelled = false;
    setApplicationStatus(null);
    fetch('/api/applications')
      .then(async (res) => {
        if (cancelled || !res.ok) return;
        const body = await res.json() as { data: Array<{ num: number; status: string }> };
        const app = body.data.find((a) => a.num === listing.report.num);
        if (app) setApplicationStatus(app.status);
      })
      .catch(() => { /* ignore */ });
    return () => { cancelled = true; };
  }, [listing, markState]);

  // Lookup cached contacts + cover after listing loaded (persistence across modal close/reopen).
  useEffect(() => {
    if (!listing) return;
    let cancelled = false;
    setCachedContactoContent(null);
    setCachedCoverContent(null);

    fetch(`/api/actions/contacto/lookup?company=${encodeURIComponent(listing.report.title)}`)
      .then(async (res) => {
        if (cancelled || !res.ok) return;
        const data = await res.json() as { content: string | null };
        if (data.content) setCachedContactoContent(data.content);
      })
      .catch(() => { /* ignore */ });

    fetch(`/api/actions/cover/lookup?listingId=${encodeURIComponent(String(listing.report.num))}`)
      .then(async (res) => {
        if (cancelled || !res.ok) return;
        const data = await res.json() as { content: string | null };
        if (data.content) setCachedCoverContent(data.content);
      })
      .catch(() => { /* ignore */ });

    return () => { cancelled = true; };
  }, [listing]);

  // Fetch job description content (raw URL fetch + extract text) after listing loaded.
  useEffect(() => {
    if (!listing) return;
    let cancelled = false;
    setJdContent(null);
    setJdError(null);
    setJdLoading(true);
    fetch(`/api/listing/${encodeURIComponent(id)}/jd`)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) { setJdError(`Fetch failed (${res.status})`); return; }
        const data = await res.json() as { url: string | null; content: string | null; error: string | null };
        if (data.content) setJdContent(data.content);
        if (data.error) setJdError(data.error);
      })
      .catch((e) => { if (!cancelled) setJdError(e instanceof Error ? e.message : 'Network error'); })
      .finally(() => { if (!cancelled) setJdLoading(false); });
    return () => { cancelled = true; };
  }, [id, listing]);

  const handleOpenInChrome = useCallback(async () => {
    if (!listing) return;
    setApplyState('pending');
    setApplyMessage('opening…');
    try {
      const res = await fetch('/api/actions/apply', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: listing.report.url ?? '' }),
      });
      if (res.ok) {
        setApplyState('success');
        setApplyMessage('opened in Chrome');
      } else {
        const body = await res.json().catch(() => ({}));
        setApplyState('error');
        setApplyMessage((body as { error?: string })?.error ?? `failed (${res.status})`);
      }
    } catch (e) {
      setApplyState('error');
      setApplyMessage(e instanceof Error ? e.message : 'network error');
    }
  }, [listing]);

  const postMarkSent = useCallback(async (status: 'Applied' | 'Discarded') => {
    if (!listing) return;
    setMarkState('pending');
    setMarkMessage(status === 'Applied' ? 'marking applied…' : 'marking discarded…');
    try {
      const res = await fetch('/api/actions/mark-sent', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: String(listing.report.num), status }),
      });
      if (res.ok) {
        setMarkState('success');
        setMarkMessage(`marked ${status.toLowerCase()} ✓`);
        // Refresh server-rendered pages (/pipeline, /today) so updated status shows.
        router.refresh();
        if (status === 'Applied') {
          setTimeout(() => { onAfterApplied?.(); onClose(); }, 800);
        }
      } else if (res.status === 423) {
        setMarkState('locked');
        setMarkMessage('Locked, try again');
      } else {
        const body = await res.json().catch(() => ({}));
        setMarkState('error');
        setMarkMessage((body as { error?: string })?.error ?? `failed (${res.status})`);
      }
    } catch (e) {
      setMarkState('error');
      setMarkMessage(e instanceof Error ? e.message : 'network error');
    }
  }, [listing, onClose, onAfterApplied, router]);

  const handleFindContacts = useCallback(async () => {
    if (!listing) return;
    try {
      const res = await fetch('/api/actions/contacto', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ company: listing.report.title }),
      });
      if (res.ok) {
        const data = await res.json() as { logPath: string };
        setContactoLogPath(data.logPath);
        setActiveTab('contacts');
      }
    } catch { /* ignore */ }
  }, [listing]);

  const handleGenerateCover = useCallback(async () => {
    if (!listing) return;
    try {
      const res = await fetch('/api/actions/cover', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ listingId: String(listing.report.num) }),
      });
      if (res.ok) {
        const data = await res.json() as { logPath: string };
        setCoverLogPath(data.logPath);
        setActiveTab('cover');
      }
    } catch { /* ignore */ }
  }, [listing]);

  const pdfHref = listing?.pdfPath
    ? `/api/file?path=${encodeURIComponent(listing.pdfPath)}`
    : null;

  return (
    <motion.div
      data-testid="motion-listing-modal"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={fadeUp.transition}
    >
      <RawListingModal
        report={listing?.report ?? null}
        pdfHref={pdfHref}
        loading={loading}
        loadError={loadError}
        applyState={applyState}
        applyMessage={applyMessage}
        markState={markState}
        markMessage={markMessage}
        contactoState={contactoState}
        contactoContent={contactoContent}
        contactoElapsedSec={contactoElapsed}
        coverState={coverState}
        coverContent={coverContent}
        coverElapsedSec={coverElapsed}
        jdContent={jdContent}
        jdError={jdError}
        jdLoading={jdLoading}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        applicationStatus={applicationStatus}
        onOpenInChrome={handleOpenInChrome}
        onMarkApplied={() => postMarkSent('Applied')}
        onMarkDiscarded={() => postMarkSent('Discarded')}
        onFindContacts={handleFindContacts}
        onGenerateCover={handleGenerateCover}
        onClose={onClose}
      />
    </motion.div>
  );
}
