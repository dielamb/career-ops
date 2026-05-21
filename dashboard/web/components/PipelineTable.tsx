'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { PipelineTable as RawPipelineTable, type PipelineRowAction, type StatusChangeAction, type ApplicationStatus } from './raw/PipelineTable';
import { ListingModal } from './ListingModal';
import type { PipelineEntry } from '@/lib/schemas';
import { fadeUp } from '@/lib/motion-presets';

export interface PipelineTableClientProps {
  rows: PipelineEntry[];
  /** Map of pipeline num → application status (from applications.md), so /pipeline view shows current status after mark-sent. */
  appStatusByNum?: Record<number, ApplicationStatus>;
}

function hostnameOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return 'unknown'; }
}

export function PipelineTable({ rows, appStatusByNum = {} }: PipelineTableClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const FILTERS_KEY = 'careerops-pipeline-filters';

  // Merge server-side app statuses with optimistic in-flight updates.
  // optimistic wins (more recent), then appStatusByNum (server state).
  const mergedStatuses = useMemo(() => {
    const merged = new Map<string, ApplicationStatus>();
    for (const [num, status] of Object.entries(appStatusByNum)) {
      merged.set(num, status);
    }
    return merged;
  }, [appStatusByNum]);

  // Initialise from localStorage if available
  const [activeStates, setActiveStates] = useState<ReadonlySet<PipelineEntry['state']>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = JSON.parse(localStorage.getItem(FILTERS_KEY) ?? '{}');
      return new Set<PipelineEntry['state']>(saved.activeStates ?? []);
    } catch { return new Set(); }
  });
  const [activeSources, setActiveSources] = useState<ReadonlySet<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = JSON.parse(localStorage.getItem(FILTERS_KEY) ?? '{}');
      return new Set<string>(saved.activeSources ?? []);
    } catch { return new Set(); }
  });
  const [minScore, setMinScore] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = JSON.parse(localStorage.getItem(FILTERS_KEY) ?? '{}');
      return typeof saved.minScore === 'number' ? saved.minScore : 0;
    } catch { return 0; }
  });
  const [search, setSearch] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      const saved = JSON.parse(localStorage.getItem(FILTERS_KEY) ?? '{}');
      return typeof saved.search === 'string' ? saved.search : '';
    } catch { return ''; }
  });
  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const [optimisticStatuses, setOptimisticStatuses] = useState<Map<string, ApplicationStatus>>(new Map());

  // Persist filters to localStorage on every change.
  useEffect(() => {
    try {
      localStorage.setItem(FILTERS_KEY, JSON.stringify({
        activeStates: Array.from(activeStates),
        activeSources: Array.from(activeSources),
        minScore,
        search,
      }));
    } catch { /* quota exceeded or private mode — ignore */ }
  }, [activeStates, activeSources, minScore, search]);

  // Auto-open modal on mount if ?id=N query present (used by /today Top 5 [Open] navigation).
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) setSelectedId(idParam);
  }, [searchParams]);

  const closeModal = () => {
    setSelectedId(null);
    // Drop ?id= from URL on close so refresh doesn't re-open.
    if (searchParams.get('id')) router.replace('/pipeline');
  };

  const allSources = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) set.add(hostnameOf(r.url));
    return Array.from(set).sort();
  }, [rows]);

  const toggleState = (s: PipelineEntry['state']) =>
    setActiveStates((cur) => { const n = new Set(cur); n.has(s) ? n.delete(s) : n.add(s); return n; });
  const toggleSource = (h: string) =>
    setActiveSources((cur) => { const n = new Set(cur); n.has(h) ? n.delete(h) : n.add(h); return n; });

  const handleRowClick = (a: PipelineRowAction) => {
    if (a.id != null) setSelectedId(a.id);
  };

  const handleStatusChange = async (action: StatusChangeAction) => {
    // Optimistic update
    setOptimisticStatuses((prev) => new Map(prev).set(action.id, action.status));
    try {
      const res = await fetch('/api/actions/mark-sent', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: action.id, status: action.status }),
      });
      if (res.ok) {
        // Refresh server data so appStatusByNum picks up the change for other rows
        router.refresh();
      } else {
        // Revert on non-2xx
        setOptimisticStatuses((prev) => {
          const next = new Map(prev);
          next.delete(action.id);
          return next;
        });
      }
    } catch {
      // On failure revert optimistic update
      setOptimisticStatuses((prev) => {
        const next = new Map(prev);
        next.delete(action.id);
        return next;
      });
    }
  };

  // Effective statuses passed to raw table: optimistic wins, then server appStatus
  const effectiveStatuses = useMemo(() => {
    const out = new Map<string, ApplicationStatus>();
    for (const [k, v] of mergedStatuses) out.set(k, v);
    for (const [k, v] of optimisticStatuses) out.set(k, v);
    return out;
  }, [mergedStatuses, optimisticStatuses]);

  return (
    <LayoutGroup>
      <motion.div
        data-testid="motion-pipeline-table"
        initial={fadeUp.initial}
        animate={fadeUp.animate}
        transition={fadeUp.transition}
        layout
      >
        <RawPipelineTable
          rows={rows}
          activeStates={activeStates}
          activeSources={activeSources}
          minScore={minScore}
          search={search}
          allSources={allSources}
          onToggleState={toggleState}
          onToggleSource={toggleSource}
          onMinScoreChange={setMinScore}
          onSearchChange={setSearch}
          onRowClick={handleRowClick}
          selectedId={selectedId}
          onStatusChange={handleStatusChange}
          optimisticStatuses={effectiveStatuses}
        />
      </motion.div>
      {selectedId != null && (
        <ListingModal
          id={selectedId}
          onClose={closeModal}
        />
      )}
    </LayoutGroup>
  );
}
