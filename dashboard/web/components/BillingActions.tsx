'use client';
import { useState } from 'react';

interface Props {
  isPro: boolean;
  hasStripeCustomer: boolean;
}

export function BillingActions({ isPro, hasStripeCustomer }: Props) {
  const [loading, setLoading] = useState(false);

  const redirectTo = async (endpoint: string) => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      const body = await res.json() as { url?: string; error?: string };
      if (res.ok && body.url) {
        window.location.href = body.url;
      } else {
        alert(body.error ?? 'Something went wrong');
        setLoading(false);
      }
    } catch {
      alert('Network error');
      setLoading(false);
    }
  };

  if (isPro && hasStripeCustomer) {
    return (
      <button
        type="button"
        onClick={() => redirectTo('/api/billing/portal')}
        disabled={loading}
        className="self-start bg-paper text-ink border-[2.5px] border-ink shadow-[4px_4px_0_var(--color-ink)] font-mono text-xs uppercase tracking-wider px-md py-sm rounded-none disabled:opacity-50 hover:bg-cyber"
      >
        {loading ? '[Loading…]' : '[Manage Subscription]'}
      </button>
    );
  }

  if (!isPro) {
    return (
      <button
        type="button"
        onClick={() => redirectTo('/api/billing/checkout')}
        disabled={loading}
        className="self-start bg-acid text-ink border-[2.5px] border-ink shadow-[4px_4px_0_var(--color-ink)] font-mono text-xs uppercase tracking-wider px-md py-sm rounded-none disabled:opacity-50"
      >
        {loading ? '[Redirecting to Stripe…]' : '[Upgrade to Pro — $9/mo]'}
      </button>
    );
  }

  return null;
}
