// POST /api/billing/portal
// Creates a Stripe Customer Portal session for subscription management
// Returns: { url }

import Stripe from 'stripe';
import { createServerSupabase } from '@/lib/supabase-server';
import { jsonError, jsonOk } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key, { apiVersion: '2026-04-22.dahlia' });
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return jsonError(401, 'Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return jsonError(400, 'No Stripe subscription found');
  }

  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch {
    return jsonError(500, 'Stripe not configured');
  }

  const origin = req.headers.get('origin') ?? 'http://localhost:3000';

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${origin}/billing`,
  });

  return jsonOk({ url: session.url });
}
