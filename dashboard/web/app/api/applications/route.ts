import { createServerSupabase } from '@/lib/supabase-server';
import { jsonOk } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return jsonOk({ data: data ?? [], errors: [] });
}
