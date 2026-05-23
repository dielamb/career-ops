import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // Surface provider-side errors first (?error=access_denied etc.)
  const providerError = searchParams.get('error');
  const providerErrorDescription = searchParams.get('error_description');
  if (providerError) {
    const url = new URL(`${origin}/auth`);
    url.searchParams.set('error', providerError);
    if (providerErrorDescription) url.searchParams.set('error_description', providerErrorDescription);
    return NextResponse.redirect(url);
  }

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      revalidatePath('/', 'layout');
      return NextResponse.redirect(`${origin}${next}`);
    }
    // Surface real error so root cause is visible instead of "callback-failed".
    const url = new URL(`${origin}/auth`);
    url.searchParams.set('error', 'exchange_failed');
    url.searchParams.set('error_description', error.message);
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(`${origin}/auth?error=missing_code`);
}
