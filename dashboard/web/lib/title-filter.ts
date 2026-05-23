// Case-insensitive substring title matcher used by per-user scan.
// At least 1 positive must match AND zero negatives may match.
// Mirrors logic from `scan.mjs` in the CLI, kept deliberately minimal —
// per-user overrides land in M3.

import type { TitleFilter } from './portals-loader';

export function matchesTitle(title: string, filter: TitleFilter): boolean {
  if (!title) return false;
  const hay = title.toLowerCase();

  for (const neg of filter.negative) {
    if (neg && hay.includes(neg.toLowerCase())) return false;
  }

  for (const pos of filter.positive) {
    if (pos && hay.includes(pos.toLowerCase())) return true;
  }

  return false;
}
