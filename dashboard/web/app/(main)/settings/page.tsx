import { createServerSupabase } from '@/lib/supabase-server';
import { SettingsForm } from '@/components/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  let cvText = '';
  let hasApiKey = false;
  let titleFilter = { positive: [] as string[], negative: [] as string[] };

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('cv_text, anthropic_api_key_encrypted, scoring_prefs')
      .eq('user_id', user.id)
      .single();
    cvText = data?.cv_text ?? '';
    hasApiKey = !!data?.anthropic_api_key_encrypted;
    const prefs = (data?.scoring_prefs ?? {}) as Record<string, unknown>;
    const tf = (prefs.title_filter ?? {}) as { positive?: string[]; negative?: string[] };
    titleFilter = { positive: tf.positive ?? [], negative: tf.negative ?? [] };
  }

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
          // profile · CV · API key
        </p>
      </header>

      <SettingsForm initialCv={cvText} hasApiKey={hasApiKey} initialTitleFilter={titleFilter} />
    </div>
  );
}
