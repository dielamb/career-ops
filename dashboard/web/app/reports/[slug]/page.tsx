import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { notFound } from 'next/navigation';
import { repoRoot } from '@/lib/api-paths';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ReportDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Path-traversal guard: reject anything with .. or /
  if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
    notFound();
  }

  const filePath = path.join(repoRoot(), 'reports', `${slug}.md`);
  let content: string;
  try {
    content = await readFile(filePath, 'utf-8');
  } catch {
    notFound();
  }

  return (
    <div className="flex flex-col gap-lg">
      <header>
        <a
          href="/reports"
          className="font-mono text-xs uppercase tracking-wider text-ink-muted hover:text-cyber"
        >
          ← All reports
        </a>
        <p className="font-mono text-xs uppercase tracking-wider text-ink-muted mt-2">
          // {slug}.md
        </p>
      </header>

      <article className="bg-paper border-[2.5px] border-ink shadow-[6px_6px_0_var(--color-ink)] rounded-none p-xl max-w-4xl">
        <pre className="font-mono text-sm text-ink whitespace-pre-wrap break-words leading-relaxed">
          {content}
        </pre>
      </article>
    </div>
  );
}
