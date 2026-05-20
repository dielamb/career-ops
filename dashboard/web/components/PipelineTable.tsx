'use client';
import { useMemo, useState } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { PipelineTable as RawPipelineTable, type PipelineRowAction } from './raw/PipelineTable';
import { ListingModal } from './ListingModal';
import type { PipelineEntry } from '@/lib/schemas';
import { fadeUp } from '@/lib/motion-presets';

export interface PipelineTableClientProps {
  rows: PipelineEntry[];
}

function hostnameOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return 'unknown'; }
}

export function PipelineTable({ rows }: PipelineTableClientProps) {
  const [activeStates, setActiveStates]   = useState<ReadonlySet<PipelineEntry['state']>>(new Set());
  const [activeSources, setActiveSources] = useState<ReadonlySet<string>>(new Set());
  const [minScore, setMinScore]           = useState<number>(0);
  const [search, setSearch]               = useState<string>('');
  const [selectedId, setSelectedId]       = useState<string | null>(null);

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
        />
      </motion.div>
      {selectedId != null && (
        <ListingModal
          id={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </LayoutGroup>
  );
}
