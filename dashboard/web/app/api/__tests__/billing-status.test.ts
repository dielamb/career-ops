import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabase: vi.fn(),
}));

import { GET } from '@/app/api/billing/status/route';
import { createServerSupabase } from '@/lib/supabase-server';

const mockCreateClient = createServerSupabase as unknown as ReturnType<typeof vi.fn>;

// Helper: build a supabase client mock where:
//  - auth.getUser returns the given user/error
//  - from('profiles').select().eq().single() resolves to profile
//  - from('usage_counters').select().eq().single() resolves to usage
function makeClient(
  authUser: { id: string } | null,
  profile: Record<string, unknown> | null,
  usage: Record<string, unknown> | null,
) {
  const tableMap: Record<string, unknown> = {
    profiles: { data: profile, error: null },
    usage_counters: { data: usage, error: null },
  };
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: authUser },
        error: authUser ? null : { message: 'No user' },
      }),
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve(tableMap[table] ?? { data: null, error: null }),
        }),
      }),
    }),
  };
}

function currentMonthStart(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

describe('GET /api/billing/status', () => {
  beforeEach(() => { mockCreateClient.mockReset(); });

  it('returns 401 when user is not authenticated', async () => {
    mockCreateClient.mockResolvedValueOnce(makeClient(null, null, null));
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns free-tier shape for free user without API key', async () => {
    mockCreateClient.mockResolvedValueOnce(makeClient(
      { id: 'u1' },
      { is_pro: false, pro_until: null, anthropic_api_key_encrypted: null },
      { eval_count: 2, month_start: currentMonthStart() },
    ));
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.isPro).toBe(false);
    expect(body.hasApiKey).toBe(false);
    expect(body.limit).toBe(5);
    expect(body.evalCount).toBe(2);
    expect(body.evalsRemaining).toBe(3);
  });

  it('returns pro-hosted shape for pro user without API key', async () => {
    mockCreateClient.mockResolvedValueOnce(makeClient(
      { id: 'u1' },
      { is_pro: true, pro_until: '2026-12-31T00:00:00Z', anthropic_api_key_encrypted: null },
      { eval_count: 50, month_start: currentMonthStart() },
    ));
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.isPro).toBe(true);
    expect(body.hasApiKey).toBe(false);
    expect(body.limit).toBe(100);
    expect(body.evalsRemaining).toBe(50);
  });

  it('returns BYOK-unlimited shape for pro user with API key', async () => {
    mockCreateClient.mockResolvedValueOnce(makeClient(
      { id: 'u1' },
      { is_pro: true, pro_until: '2026-12-31T00:00:00Z', anthropic_api_key_encrypted: 'sk-ant-xxx' },
      { eval_count: 200, month_start: currentMonthStart() },
    ));
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.isPro).toBe(true);
    expect(body.hasApiKey).toBe(true);
    expect(body.limit).toBeNull();
    expect(body.evalsRemaining).toBeNull();
  });
});
