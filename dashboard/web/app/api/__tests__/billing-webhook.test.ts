import { describe, it, expect, vi, beforeEach } from 'vitest';

// ──────────────────────────────────────────────────────────────────────────
// Module mocks — MUST be at top, before the route is imported.
// ──────────────────────────────────────────────────────────────────────────

const mockConstructEvent = vi.fn();
const mockSubscriptionsRetrieve = vi.fn();

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    webhooks: { constructEvent: mockConstructEvent },
    subscriptions: { retrieve: mockSubscriptionsRetrieve },
  })),
}));

const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });

vi.mock('@/lib/supabase-server', () => ({
  createAdminSupabase: vi.fn(() => ({ from: mockFrom })),
  createServerSupabase: vi.fn(),
}));

import { POST } from '@/app/api/billing/webhook/route';

// ──────────────────────────────────────────────────────────────────────────
// Test helpers
// ──────────────────────────────────────────────────────────────────────────

function makeReq(body: string, headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/billing/webhook', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body,
  });
}

beforeEach(() => {
  mockConstructEvent.mockReset();
  mockSubscriptionsRetrieve.mockReset();
  mockUpdate.mockClear();
  mockFrom.mockClear();
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  process.env.STRIPE_SECRET_KEY = 'sk_test';
});

describe('POST /api/billing/webhook', () => {
  it('returns 400 when stripe signature is invalid', async () => {
    mockConstructEvent.mockImplementationOnce(() => {
      throw new Error('Invalid signature');
    });
    const res = await POST(makeReq('{}', { 'stripe-signature': 'bad' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid webhook signature');
  });

  it('returns 400 when stripe-signature header is missing', async () => {
    mockConstructEvent.mockImplementationOnce(() => {
      throw new Error('No signature header');
    });
    const res = await POST(makeReq('{}'));
    expect(res.status).toBe(400);
  });

  it('flips is_pro=true on customer.subscription.created (trialing)', async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: 'customer.subscription.created',
      data: { object: {
        metadata: { supabase_user_id: 'user-1' },
        customer: 'cus_X',
        status: 'trialing',
        items: { data: [{ current_period_end: 1800000000 }] },
      } },
    });
    const res = await POST(makeReq('{}', { 'stripe-signature': 'sig' }));
    expect(res.status).toBe(200);
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    const updateArg = mockUpdate.mock.calls[0][0];
    expect(updateArg.is_pro).toBe(true);
    expect(updateArg.stripe_customer_id).toBe('cus_X');
    expect(typeof updateArg.pro_until).toBe('string');
  });

  it('flips is_pro=true on customer.subscription.updated (active)', async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: 'customer.subscription.updated',
      data: { object: {
        metadata: { supabase_user_id: 'user-1' },
        customer: 'cus_X',
        status: 'active',
        items: { data: [{ current_period_end: 1800000000 }] },
      } },
    });
    const res = await POST(makeReq('{}', { 'stripe-signature': 'sig' }));
    expect(res.status).toBe(200);
    const updateArg = mockUpdate.mock.calls[0][0];
    expect(updateArg.is_pro).toBe(true);
  });

  it('flips is_pro=false on customer.subscription.deleted', async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: 'customer.subscription.deleted',
      data: { object: {
        metadata: { supabase_user_id: 'user-1' },
        customer: 'cus_X',
        status: 'canceled',
      } },
    });
    const res = await POST(makeReq('{}', { 'stripe-signature': 'sig' }));
    expect(res.status).toBe(200);
    const updateArg = mockUpdate.mock.calls[0][0];
    expect(updateArg.is_pro).toBe(false);
    expect(updateArg.pro_until).toBeNull();
  });

  it('flips is_pro=false on invoice.payment_failed when subscription is past_due', async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: 'invoice.payment_failed',
      data: { object: { subscription: 'sub_X' } },
    });
    mockSubscriptionsRetrieve.mockResolvedValueOnce({
      metadata: { supabase_user_id: 'user-1' },
      customer: 'cus_X',
      status: 'past_due',
    });
    const res = await POST(makeReq('{}', { 'stripe-signature': 'sig' }));
    expect(res.status).toBe(200);
    expect(mockSubscriptionsRetrieve).toHaveBeenCalledWith('sub_X');
    const updateArg = mockUpdate.mock.calls[0][0];
    expect(updateArg.is_pro).toBe(false);
  });

  it('does NOT downgrade on invoice.payment_failed when subscription is still active (grace period)', async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: 'invoice.payment_failed',
      data: { object: { subscription: 'sub_X' } },
    });
    mockSubscriptionsRetrieve.mockResolvedValueOnce({
      metadata: { supabase_user_id: 'user-1' },
      customer: 'cus_X',
      status: 'active',
    });
    const res = await POST(makeReq('{}', { 'stripe-signature': 'sig' }));
    expect(res.status).toBe(200);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('skips DB write when subscription metadata.supabase_user_id is missing', async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: 'customer.subscription.created',
      data: { object: {
        metadata: {},
        customer: 'cus_X',
        status: 'active',
        items: { data: [{ current_period_end: 1800000000 }] },
      } },
    });
    const res = await POST(makeReq('{}', { 'stripe-signature': 'sig' }));
    expect(res.status).toBe(200);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
