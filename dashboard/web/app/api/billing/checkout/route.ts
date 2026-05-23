// POST /api/billing/checkout
// Creates a Stripe Checkout session for the Pro subscription
// Returns: { url } — redirect the user there

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

  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!priceId) return jsonError(500, 'STRIPE_PRO_PRICE_ID not configured');

  const origin = req.headers.get('origin') ?? 'http://localhost:3000';

  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch {
    return jsonError(500, 'Stripe not configured');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, is_pro')
    .eq('user_id', user.id)
    .single();

  if (profile?.is_pro) {
    return jsonError(400, 'Already on Pro plan');
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/billing?success=1`,
    cancel_url: `${origin}/billing?canceled=1`,
    metadata: { supabase_user_id: user.id },
    subscription_data: {
      metadata: { supabase_user_id: user.id },
      trial_period_days: 7,
    },
  };

  if (profile?.stripe_customer_id) {
    sessionParams.customer = profile.stripe_customer_id;
  } else {
    sessionParams.customer_email = user.email;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return jsonOk({ url: session.url });
}
