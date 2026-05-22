// POST /api/billing/webhook
// Stripe webhook: syncs subscription status to Supabase profiles

import Stripe from 'stripe';
import { createAdminSupabase } from '@/lib/supabase-server';
import { jsonError } from '@/lib/api-helpers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key, { apiVersion: '2026-04-22.dahlia' });
}

async function setProStatus(
  supabase: ReturnType<typeof createAdminSupabase>,
  userId: string,
  customerId: string,
  isPro: boolean,
  proUntil: string | null,
) {
  await supabase
    .from('profiles')
    .update({ is_pro: isPro, pro_until: proUntil, stripe_customer_id: customerId })
    .eq('user_id', userId);
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return jsonError(500, 'STRIPE_WEBHOOK_SECRET not configured');

  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch {
    return jsonError(500, 'Stripe not configured');
  }

  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return jsonError(400, 'Invalid webhook signature');
  }

  const supabase = createAdminSupabase();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const customerId = session.customer as string;
      if (!userId || !customerId) break;
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId);
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      const customerId = sub.customer as string;
      if (!userId) break;
      const isActive = sub.status === 'active' || sub.status === 'trialing';
      const periodEnd = sub.items.data[0]?.current_period_end;
      const proUntil = isActive && periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : null;
      await setProStatus(supabase, userId, customerId, isActive, proUntil);
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      const customerId = sub.customer as string;
      if (!userId) break;
      await setProStatus(supabase, userId, customerId, false, null);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const subRef = 'subscription' in invoice ? (invoice as { subscription?: string | null }).subscription : null;
      const sub = subRef
        ? await stripe.subscriptions.retrieve(subRef as string)
        : null;
      const userId = sub?.metadata?.supabase_user_id;
      if (!userId) break;
      if (sub && (sub.status === 'past_due' || sub.status === 'unpaid')) {
        await setProStatus(supabase, userId, sub.customer as string, false, null);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
