import path from 'node:path';

/**
 * Repo root resolved from dashboard/web cwd.
 * Next.js API routes run with cwd === dashboard/web/, so we step up two dirs.
 */
export function repoRoot(): string {
  return path.resolve(process.cwd(), '..', '..');
}

/** Path to data/applications.md from repo root. */
export function applicationsPath(): string {
  return path.join(repoRoot(), 'data', 'applications.md');
}

/** Path to data/pipeline.md from repo root. */
export function pipelinePath(): string {
  return path.join(repoRoot(), 'data', 'pipeline.md');
}

/** Path to reports/ directory from repo root. */
export function reportsDir(): string {
  return path.join(repoRoot(), 'reports');
}

/** Path to output/ directory from repo root. */
export function outputDir(): string {
  return path.join(repoRoot(), 'output');
}
