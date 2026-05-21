import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { repoRoot } from '@/lib/api-paths';

async function loadFile(rel: string): Promise<string | null> {
  try {
    return await readFile(path.join(repoRoot(), rel), 'utf-8');
  } catch {
    return null;
  }
}

export default async function SettingsPage() {
  const profile = await loadFile('config/profile.yml');
  const design = await loadFile('DESIGN.md');
  const dataContract = await loadFile('DATA_CONTRACT.md');

  return (
    <div className="flex flex-col gap-2xl">
      <header>
        <h1
          className="font-display font-extrabold text-5xl text-ink"
          style={{ fontVariationSettings: '"wdth" 60' }}
        >
          Settings.
        </h1>
        <p className="font-mono text-xs uppercase tracking-wider text-ink-muted mt-2">
          // read-only view of user config + design system
        </p>
      </header>

      <section className="flex flex-col gap-md">
        <h2 className="font-mono text-xs uppercase tracking-wider text-ink">// config/profile.yml</h2>
        <pre className="bg-paper border-[2.5px] border-ink shadow-[4px_4px_0_var(--color-ink)] rounded-none p-md font-mono text-sm text-ink whitespace-pre-wrap break-words leading-relaxed">
          {profile ?? '(file not found)'}
        </pre>
      </section>

      <section className="flex flex-col gap-md">
        <h2 className="font-mono text-xs uppercase tracking-wider text-ink">// DESIGN.md (Y2K tokens)</h2>
        <pre className="bg-paper border-[2.5px] border-ink shadow-[4px_4px_0_var(--color-ink)] rounded-none p-md font-mono text-sm text-ink whitespace-pre-wrap break-words leading-relaxed max-h-96 overflow-auto">
          {design ?? '(file not found)'}
        </pre>
      </section>

      <section className="flex flex-col gap-md">
        <h2 className="font-mono text-xs uppercase tracking-wider text-ink">// DATA_CONTRACT.md</h2>
        <pre className="bg-paper border-[2.5px] border-ink shadow-[4px_4px_0_var(--color-ink)] rounded-none p-md font-mono text-sm text-ink whitespace-pre-wrap break-words leading-relaxed max-h-96 overflow-auto">
          {dataContract ?? '(file not found)'}
        </pre>
      </section>
    </div>
  );
}
