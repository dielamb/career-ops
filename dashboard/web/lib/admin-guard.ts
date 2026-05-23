// Phase 0 safety: gate filesystem-backed routes to a single admin email
// until per-user data flow ships. Without this guard, every signed-in
// user sees the admin's personal pipeline / reports / PDFs.

import { createServerSupabase } from './supabase-server';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? 'maciejkamichal@gmail.com')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function isAdmin(): Promise<boolean> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}
