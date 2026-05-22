'use client';
import { useState } from 'react';
import { useToast } from './Toast';

interface Props {
  initialCv: string;
  hasApiKey: boolean;
}

export function SettingsForm({ initialCv, hasApiKey }: Props) {
  const { showToast } = useToast();
  const [cv, setCv] = useState(initialCv);
  const [apiKey, setApiKey] = useState('');
  const [savingCv, setSavingCv] = useState(false);
  const [savingKey, setSavingKey] = useState(false);

  const save = async (payload: { cvText?: string; apiKey?: string }, label: string,
    setSaving: (v: boolean) => void) => {
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
          Paste your CV in plain text or Markdown. Claude uses this to score job fit.
        </p>
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
    </div>
  );
}
