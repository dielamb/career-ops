import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { repoRoot } from '@/lib/api-paths';

interface ReportEntry {
  slug: string;        // "001-hostaway-2026-04-21"
  filename: string;
  hasPdf: boolean;
  firstLine: string;   // h1 from MD if present
}

async function listReports(): Promise<ReportEntry[]> {
  const reportsDir = path.join(repoRoot(), 'reports');
  const outputDir = path.join(repoRoot(), 'output');
  let entries: string[];
  try {
    entries = await readdir(reportsDir);
  } catch {
    return [];
  }
  const mdFiles = entries.filter((f) => f.endsWith('.md')).sort();

  const pdfs = new Set<string>();
  try {
    const outFiles = await readdir(outputDir);
    for (const f of outFiles) if (f.endsWith('.pdf')) pdfs.add(f.replace(/\.pdf$/, ''));
  } catch {
    // output dir may not exist yet
  }

  const out: ReportEntry[] = [];
  for (const filename of mdFiles) {
    const slug = filename.replace(/\.md$/, '');
    let firstLine = '';
    try {
      const content = await readFile(path.join(reportsDir, filename), 'utf-8');
      const m = content.match(/^#\s+(.+)$/m);
      if (m) firstLine = m[1].trim();
    } catch {
      // skip
    }
    out.push({ slug, filename, hasPdf: pdfs.has(slug), firstLine });
  }
  return out;
}

export default async function ReportsPage() {
  const reports = await listReports();

  return (
    <div className="flex flex-col gap-2xl">
      <header>
        <h1
          className="font-display font-extrabold text-5xl text-ink"
          style={{ fontVariationSettings: '"wdth" 60' }}
        >
          Reports.
        </h1>
        <p className="font-mono text-xs uppercase tracking-wider text-ink-muted mt-2">
          // {reports.length} evaluation report{reports.length === 1 ? '' : 's'}
        </p>
      </header>

      {reports.length === 0 ? (
        <p className="font-body text-base text-ink-muted">
          No reports found. Run an evaluation first.
        </p>
      ) : (
        <ul className="flex flex-col gap-sm">
          {reports.map((r) => (
            <li
              key={r.slug}
              className="bg-paper border-[2.5px] border-ink shadow-[4px_4px_0_var(--color-ink)] rounded-none p-md flex items-center justify-between gap-md"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <span className="font-mono text-xs text-ink-muted">{r.slug}</span>
                <span className="font-display font-bold text-lg text-ink truncate">
                  {r.firstLine || r.filename}
                </span>
              </div>
              <div className="flex items-center gap-sm shrink-0">
                <a
                  href={`/reports/${encodeURIComponent(r.slug)}`}
                  className="bg-paper text-ink font-mono text-xs uppercase tracking-wider border-[1.5px] border-ink px-3 py-1 rounded-none hover:bg-acid"
                >
                  MD →
                </a>
                {r.hasPdf && (
                  <a
                    href={`/api/file?path=${encodeURIComponent(`${process.env.PWD ?? ''}/../../output/${r.slug}.pdf`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-ink text-paper font-mono text-xs uppercase tracking-wider border-[1.5px] border-ink px-3 py-1 rounded-none hover:bg-cyber hover:text-ink"
                  >
                    PDF →
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
