import { describe, it, expect, vi, beforeEach } from 'vitest';

// ──────────────────────────────────────────────────────────────────────────
// Module mocks
// ──────────────────────────────────────────────────────────────────────────

const mockSessionsCreate = vi.fn();

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    checkout: { sessions: { create: mockSessionsCreate } },
  })),
}));

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabase: vi.fn(),
}));

import { POST } from '@/app/api/billing/checkout/route';
import { createServerSupabase } from '@/lib/supabase-server';

const mockCreateClient = createServerSupabase as unknown as ReturnType<typeof vi.fn>;

function makeClient(
  authUser: { id: string; email?: string } | null,
  profile: Record<string, unknown> | null,
) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: authUser },
        error: authUser ? null : { message: 'No user' },
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: profile, error: null }),
        }),
      }),
    }),
  };
}

function makeReq(): Request {
  return new Request('http://localhost/api/billing/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
  });
}

beforeEach(() => {
  mockCreateClient.mockReset();
  mockSessionsCreate.mockReset();
  process.env.STRIPE_SECRET_KEY = 'sk_test';
  process.env.STRIPE_PRO_PRICE_ID = 'price_test';
});

describe('POST /api/billing/checkout', () => {
  it('returns 401 when user is not authenticated', async () => {
    mockCreateClient.mockResolvedValueOnce(makeClient(null, null));
    const res = await POST(makeReq());
    expect(res.status).toBe(401);
  });

  it('returns 400 when user is already on Pro plan', async () => {
    mockCreateClient.mockResolvedValueOnce(makeClient(
      { id: 'u1', email: 'a@b.com' },
      { is_pro: true, stripe_customer_id: 'cus_X' },
    ));
    const res = await POST(makeReq());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Already on Pro/);
  });

  it('returns 500 when STRIPE_PRO_PRICE_ID is not configured', async () => {
    delete process.env.STRIPE_PRO_PRICE_ID;
    mockCreateClient.mockResolvedValueOnce(makeClient(
      { id: 'u1', email: 'a@b.com' },
      { is_pro: false, stripe_customer_id: null },
    ));
    const res = await POST(makeReq());
    expect(res.status).toBe(500);
  });

  it('creates a Stripe session with 7-day trial and /settings?welcome=pro success_url', async () => {
    mockCreateClient.mockResolvedValueOnce(makeClient(
      { id: 'u1', email: 'a@b.com' },
      { is_pro: false, stripe_customer_id: null },
    ));
    mockSessionsCreate.mockResolvedValueOnce({ url: 'https://checkout.stripe.test/c/sess_X' });

    const res = await POST(makeReq());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBe('https://checkout.stripe.test/c/sess_X');

    expect(mockSessionsCreate).toHaveBeenCalledTimes(1);
    const sessionParams = mockSessionsCreate.mock.calls[0][0];
    expect(sessionParams.mode).toBe('subscription');
    expect(sessionParams.success_url).toContain('/settings?welcome=pro');
    expect(sessionParams.cancel_url).toContain('/billing?canceled=1');
    expect(sessionParams.metadata.supabase_user_id).toBe('u1');
    expect(sessionParams.subscription_data.trial_period_days).toBe(7);
    expect(sessionParams.subscription_data.metadata.supabase_user_id).toBe('u1');
    expect(sessionParams.customer_email).toBe('a@b.com');
  });
});
