import { createServerSupabase } from '@/lib/supabase-server';
import { SettingsForm } from '@/components/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  let cvText = '';
  let hasApiKey = false;

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('cv_text, anthropic_api_key_encrypted')
      .eq('user_id', user.id)
      .single();
    cvText = data?.cv_text ?? '';
    hasApiKey = !!data?.anthropic_api_key_encrypted;
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

      <SettingsForm initialCv={cvText} hasApiKey={hasApiKey} />
    </div>
  );
}
