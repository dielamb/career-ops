'use client';
import { useState, useRef } from 'react';
import { useToast } from './Toast';

interface TitleFilter { positive: string[]; negative: string[] }

interface Props {
  initialCv: string;
  hasApiKey: boolean;
  initialTitleFilter?: TitleFilter;
}

export function SettingsForm({ initialCv, hasApiKey, initialTitleFilter }: Props) {
  const { showToast } = useToast();
  const [cv, setCv] = useState(initialCv);
  const [apiKey, setApiKey] = useState('');
  const [savingCv, setSavingCv] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [positive, setPositive] = useState<string[]>(initialTitleFilter?.positive ?? []);
  const [negative, setNegative] = useState<string[]>(initialTitleFilter?.negative ?? []);
  const [newPositive, setNewPositive] = useState('');
  const [newNegative, setNewNegative] = useState('');
  const [savingFilter, setSavingFilter] = useState(false);

  const uploadPdf = async (file: File) => {
    setUploadingPdf(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/profile/cv-pdf', { method: 'POST', body: form });
      const body = await res.json().catch(() => ({})) as Record<string, unknown>;
      if (res.ok) {
        const extracted = body.cvText as string;
        setCv(extracted);
        const method = body.extractionMethod === 'pdf-parse' ? ' (pdf-parse fallback — layout may vary)' : '';
        showToast(`PDF extracted: ${String(body.charCount)} chars${method}. Review and save.`, 'success');
      } else {
        showToast((body as { error?: string }).error ?? 'PDF upload failed', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setUploadingPdf(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const save = async (
    payload: { cvText?: string; apiKey?: string; titleFilter?: TitleFilter },
    label: string,
    setSaving: (v: boolean) => void,
  ) => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast(`${label} saved`, 'success');
        if (payload.apiKey !== undefined) setApiKey('');
      } else {
        const body = await res.json().catch(() => ({}));
        showToast((body as { error?: string }).error ?? `Failed to save ${label}`, 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2xl">
      {/* CV section */}
      <section className="flex flex-col gap-md">
        <h2 className="font-mono text-xs uppercase tracking-wider text-ink">// CV (used for job scoring)</h2>
        <p className="font-body text-sm text-ink-muted">
          Upload a PDF or paste plain text / Markdown. Claude uses this to score job fit.
        </p>

        {/* PDF upload */}
        <div className="flex items-center gap-sm">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPdf(f); }}
            className="hidden"
            id="cv-pdf-input"
          />
          <label
            htmlFor="cv-pdf-input"
            className={`inline-block cursor-pointer bg-acid text-ink border-[2px] border-ink shadow-[2px_2px_0_var(--color-ink)] font-mono text-xs uppercase tracking-wider px-md py-sm rounded-none ${uploadingPdf ? 'opacity-50 pointer-events-none' : 'hover:bg-cyber'}`}
          >
            {uploadingPdf ? '[Extracting…]' : '[Upload PDF]'}
          </label>
          <span className="font-mono text-xs text-ink-muted">max 5 MB · text-based PDF only</span>
        </div>

        <textarea
          value={cv}
          onChange={(e) => setCv(e.target.value)}
          rows={18}
          placeholder="# Your Name&#10;&#10;## Experience&#10;..."
          className="w-full px-md py-sm bg-paper border-[2.5px] border-ink rounded-none font-mono text-sm text-ink placeholder:text-ink-dim focus:outline-none focus:border-cyber resize-y"
        />
        <button
          type="button"
          onClick={() => save({ cvText: cv }, 'CV', setSavingCv)}
          disabled={savingCv || !cv.trim()}
          className="self-start bg-cyber text-ink border-[2.5px] border-ink shadow-[3px_3px_0_var(--color-ink)] font-mono text-xs uppercase tracking-wider px-md py-sm rounded-none disabled:opacity-50"
        >
          {savingCv ? '[Saving…]' : '[Save CV]'}
        </button>
      </section>

      {/* API key section */}
      <section className="flex flex-col gap-md">
        <h2 className="font-mono text-xs uppercase tracking-wider text-ink">// Anthropic API key</h2>
        <p className="font-body text-sm text-ink-muted">
          {hasApiKey
            ? 'API key is set. Paste a new one to replace it.'
            : 'Optional — use your own Claude API key instead of the server key.'}
        </p>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={hasApiKey ? '••••••• (set — enter new to replace)' : 'sk-ant-...'}
          className="w-full px-sm py-xs bg-paper border-[2px] border-ink rounded-none font-mono text-sm text-ink placeholder:text-ink-dim focus:outline-none focus:border-cyber"
        />
        <button
          type="button"
          onClick={() => save({ apiKey }, 'API key', setSavingKey)}
          disabled={savingKey || !apiKey.trim()}
          className="self-start bg-paper text-ink border-[2px] border-ink shadow-[2px_2px_0_var(--color-ink)] font-mono text-xs uppercase tracking-wider px-md py-sm rounded-none disabled:opacity-50 hover:bg-chrome"
        >
          {savingKey ? '[Saving…]' : '[Save API Key]'}
        </button>
      </section>

      {/* Title filter section (M3) */}
      <section className="flex flex-col gap-md">
        <h2 className="font-mono text-xs uppercase tracking-wider text-ink">// Title filter (extends default)</h2>
        <p className="font-body text-sm text-ink-muted">
          Portal scans keep titles that match at least one positive keyword and
          zero negatives. Your keywords are added on top of the curated default
          (e.g. &quot;Design System&quot;, &quot;Token&quot;) — never replace it.
        </p>

        {(['positive', 'negative'] as const).map((kind) => {
          const list = kind === 'positive' ? positive : negative;
          const setList = kind === 'positive' ? setPositive : setNegative;
          const draft = kind === 'positive' ? newPositive : newNegative;
          const setDraft = kind === 'positive' ? setNewPositive : setNewNegative;
          const tint = kind === 'positive' ? 'bg-acid' : 'bg-magenta text-bg';
          const addKeyword = () => {
            const v = draft.trim();
            if (!v) return;
            if (list.some((k) => k.toLowerCase() === v.toLowerCase())) {
              setDraft('');
              return;
            }
            setList([...list, v]);
            setDraft('');
          };
          return (
            <div key={kind} className="flex flex-col gap-xs">
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                {kind === 'positive' ? '// must match (any)' : '// must NOT match'}
              </p>
              <div className="flex flex-wrap gap-xs">
                {list.map((k) => (
                  <span key={k} className={`inline-flex items-center gap-xs px-sm py-[2px] border-[1.5px] border-ink font-mono text-xs ${tint}`}>
                    {k}
                    <button
                      type="button"
                      onClick={() => setList(list.filter((x) => x !== k))}
                      className="opacity-70 hover:opacity-100"
                      aria-label={`Remove ${k}`}
                    >×</button>
                  </span>
                ))}
                {list.length === 0 && (
                  <span className="font-mono text-xs text-ink-dim">none</span>
                )}
              </div>
              <div className="flex gap-xs">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                  placeholder={kind === 'positive' ? 'e.g. Senior Frontend' : 'e.g. Java'}
                  className="flex-1 px-sm py-xs bg-paper border-[1.5px] border-ink rounded-none font-mono text-xs focus:outline-none focus:border-cyber"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="bg-paper text-ink border-[1.5px] border-ink font-mono text-xs uppercase tracking-wider px-md py-xs hover:bg-chrome"
                >Add</button>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => save({ titleFilter: { positive, negative } }, 'Title filter', setSavingFilter)}
          disabled={savingFilter}
          className="self-start bg-cyber text-ink border-[2.5px] border-ink shadow-[3px_3px_0_var(--color-ink)] font-mono text-xs uppercase tracking-wider px-md py-sm rounded-none disabled:opacity-50"
        >
          {savingFilter ? '[Saving…]' : '[Save filter]'}
        </button>
      </section>
    </div>
  );
}
