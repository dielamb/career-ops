'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  PipelineTable as RawPipelineTable,
  type PipelineRowAction,
  type StatusChangeAction,
  type ApplicationStatus,
  type SortCol,
  type SortDir,
} from './raw/PipelineTable';
import { ListingModal } from './ListingModal';
import type { EnrichedPipelineEntry } from '@/lib/schemas';
import { fadeUp } from '@/lib/motion-presets';

export interface PipelineTableClientProps {
  rows: EnrichedPipelineEntry[];
  appStatusByNum?: Record<number, ApplicationStatus>;
}

const FILTERS_KEY = 'careerops-pipeline-v3';

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(FILTERS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return (parsed[key] as T) ?? fallback;
  } catch { return fallback; }
}

export function PipelineTable({ rows, appStatusByNum = {} }: PipelineTableClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sortCol, setSortCol] = useState<SortCol>(() => readStorage<SortCol>('sortCol', 'score'));
  const [sortDir, setSortDir] = useState<SortDir>(() => readStorage<SortDir>('sortDir', 'desc'));
  const [search, setSearch] = useState<string>(() => readStorage('search', ''));
  const [minScore, setMinScore] = useState<number>(() => readStorage('minScore', 0));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [optimisticStatuses, setOptimisticStatuses] = useState<Map<string, ApplicationStatus>>(new Map());

  const mergedStatuses = useMemo(() => {
    const m = new Map<string, ApplicationStatus>();
    for (const [num, status] of Object.entries(appStatusByNum)) m.set(num, status);
    return m;
  }, [appStatusByNum]);

  useEffect(() => {
    try {
      localStorage.setItem(FILTERS_KEY, JSON.stringify({ sortCol, sortDir, search, minScore }));
    } catch { /* quota / private */ }
  }, [sortCol, sortDir, search, minScore]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) setSelectedId(id);
  }, [searchParams]);

  const handleSortChange = (col: SortCol) => {
    if (col === sortCol) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir(col === 'score' || col === 'num' ? 'desc' : 'asc');
    }
  };

  const closeModal = () => {
    setSelectedId(null);
    if (searchParams.get('id')) router.replace('/pipeline');
  };

  const handleRowClick = (a: PipelineRowAction) => {
    if (a.entry.state === 'evaluated' && a.id != null) {
      // Evaluated + has report → open in-dashboard modal
      setSelectedId(a.id);
    } else {
      // No report → open external JD in new tab
      window.open(a.entry.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleStatusChange = async (action: StatusChangeAction) => {
    setOptimisticStatuses((prev) => new Map(prev).set(action.id, action.status));
    try {
      const res = await fetch('/api/actions/mark-sent', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: action.id, status: action.status }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        setOptimisticStatuses((prev) => { const n = new Map(prev); n.delete(action.id); return n; });
      }
    } catch {
      setOptimisticStatuses((prev) => { const n = new Map(prev); n.delete(action.id); return n; });
    }
  };

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
          sortCol={sortCol}
          sortDir={sortDir}
          search={search}
          minScore={minScore}
          onSortChange={handleSortChange}
          onSearchChange={setSearch}
          onMinScoreChange={setMinScore}
          onRowClick={handleRowClick}
          selectedId={selectedId}
          onStatusChange={handleStatusChange}
          optimisticStatuses={effectiveStatuses}
        />
      </motion.div>

      {selectedId != null && (
        <ListingModal id={selectedId} onClose={closeModal} />
      )}
    </LayoutGroup>
  );
}
