// Load the shared `portals.yml` config (repo root) and expose only the
// fields per-user scan needs: company list + global title filter.
//
// M1 ships a single curated portals.yml for all users. Per-user overrides
// (M3) will layer on top of this loader's output.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export interface TrackedCompany {
  /** Display name from portals.yml */
  name: string;
  /** Branded or ATS-hosted careers URL */
  careers_url: string;
  /** Optional explicit ATS provider hint (currently unused — auto-detect wins) */
  ats?: string;
  /** Explicit Greenhouse API URL override (used by detectProvider) */
  api?: string;
  /** Per-entry enabled flag — defaults to true when omitted */
  enabled?: boolean;
}

export interface TitleFilter {
  positive: string[];
  negative: string[];
}

export interface PortalsConfig {
  trackedCompanies: TrackedCompany[];
  titleFilter: TitleFilter;
}

interface RawPortals {
  title_filter?: { positive?: string[]; negative?: string[] };
  tracked_companies?: Array<{
    name?: string;
    careers_url?: string;
    ats?: string;
    api?: string;
    enabled?: boolean;
  }>;
}

let cached: { mtimeMs: number; value: PortalsConfig } | null = null;

/**
 * Resolve `portals.yml` from the repo root. The Next.js process runs from
 * `dashboard/web/`, so we walk up two levels. Override with `PORTALS_YML_PATH`
 * for tests / non-standard deployments.
 */
function resolvePath(): string {
  return (
    process.env.PORTALS_YML_PATH ??
    path.join(process.cwd(), '..', '..', 'portals.yml')
  );
}

export async function loadPortals(): Promise<PortalsConfig> {
  const file = resolvePath();
  const stat = await fs.stat(file);
  if (cached && cached.mtimeMs === stat.mtimeMs) return cached.value;

  const raw = await fs.readFile(file, 'utf8');
  const parsed = yaml.load(raw) as RawPortals | null;

  const companies: TrackedCompany[] = (parsed?.tracked_companies ?? [])
    .filter((c) => typeof c?.name === 'string' && typeof c?.careers_url === 'string')
    .filter((c) => c.enabled !== false)
    .map((c) => ({
      name: c.name as string,
      careers_url: c.careers_url as string,
      ats: c.ats,
      api: c.api,
      enabled: c.enabled,
    }));

  const value: PortalsConfig = {
    trackedCompanies: companies,
    titleFilter: {
      positive: parsed?.title_filter?.positive ?? [],
      negative: parsed?.title_filter?.negative ?? [],
    },
  };

  cached = { mtimeMs: stat.mtimeMs, value };
  return value;
}
