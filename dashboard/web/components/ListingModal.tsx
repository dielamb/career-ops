'use client';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ListingModal as RawListingModal, type ModalActionState } from './raw/ListingModal';
import type { Report } from '@/lib/schemas';
import { fadeUp } from '@/lib/motion-presets';

export interface ListingModalClientProps {
  id: string;
  onClose: () => void;
  /** Optional callback after successful Mark Applied. Parent can refresh data. */
  onAfterApplied?: () => void;
}

interface LoadedListing { report: Report; pdfPath: string | null; }

export function ListingModal({ id, onClose, onAfterApplied }: ListingModalClientProps) {
  const [loading, setLoading]     = useState(true);
  const [listing, setListing]     = useState<LoadedListing | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [applyState, setApplyState]     = useState<ModalActionState>('idle');
  const [applyMessage, setApplyMessage] = useState<string | null>(null);
  const [markState,  setMarkState]      = useState<ModalActionState>('idle');
  const [markMessage, setMarkMessage]   = useState<string | null>(null);

  // GET /api/listing/[id] on mount + id change.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setListing(null);
    setLoadError(null);

    fetch(`/api/listing/${encodeURIComponent(id)}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) {
          setLoadError('Listing not found');
          return;
        }
        if (!res.ok) {
          setLoadError(`Failed to load listing (${res.status})`);
          return;
        }
        const body = await res.json();
        setListing({ report: body.report, pdfPath: body.pdfPath ?? null });
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : 'Network error');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  // ESC closes.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

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
        setMarkMessage(`marked ${status.toLowerCase()}`);
        // On Applied, close after a short delay so the user sees the confirmation.
        if (status === 'Applied') {
          setTimeout(() => {
            onAfterApplied?.();
            onClose();
          }, 500);
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
  }, [listing, onClose, onAfterApplied]);

  // pdfPath from API is an absolute filesystem path; serve via /api/file passthrough route.
  // Falls back to null if pdfPath is absent, showing the "PDF unavailable" pane.
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
        onOpenInChrome={handleOpenInChrome}
        onMarkApplied={() => postMarkSent('Applied')}
        onMarkDiscarded={() => postMarkSent('Discarded')}
        onClose={onClose}
      />
    </motion.div>
  );
}
