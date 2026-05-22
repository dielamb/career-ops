import { describe, it, expect, vi, beforeEach } from 'vitest';

// ──────────────────────────────────────────────────────────────────────────
// Module mocks
// ──────────────────────────────────────────────────────────────────────────

const mockMessagesCreate = vi.fn();
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: mockMessagesCreate },
  })),
}));

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabase: vi.fn(),
}));

// ats-fetch is called only if no jdText is provided — we always pass jdText
// to keep the test focused on the gate.
vi.mock('@/lib/ats-fetch', () => ({
  fetchJobDescription: vi.fn(),
  AtsFetchError: class AtsFetchError extends Error {},
}));

// spawn-mjs validateUrl: we pass valid https URLs so the real validator works.
// No need to mock it.

import { POST } from '@/app/api/intake/route';
import { createServerSupabase } from '@/lib/supabase-server';

const mockCreateClient = createServerSupabase as unknown as ReturnType<typeof vi.fn>;

// ──────────────────────────────────────────────────────────────────────────
// Supabase client mock builder
// ──────────────────────────────────────────────────────────────────────────

function makeClient(opts: {
  authUser: { id: string } | null;
  profile: Record<string, unknown> | null;
  usage?: Record<string, unknown> | null;  // returned when route fetches usage_counters after a blocked RPC
  rpcReturn: number | null;
  rpcError?: { message: string } | null;
  listingInsertId?: string;
  pipelineInsertId?: string;
}) {
  const mockRpc = vi.fn().mockResolvedValue({
    data: opts.rpcReturn,
    error: opts.rpcError ?? null,
  });
  const mockListingInsert = vi.fn().mockReturnValue({
    select: () => ({ single: () => Promise.resolve({ data: { id: opts.listingInsertId ?? 'lst-1' }, error: null }) }),
  });
  const mockPipelineInsert = vi.fn().mockReturnValue({
    select: () => ({ single: () => Promise.resolve({ data: { id: opts.pipelineInsertId ?? 'pipe-1' }, error: null }) }),
  });
  const client = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: opts.authUser },
        error: opts.authUser ? null : { message: 'No user' },
      }),
    },
    rpc: mockRpc,
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: opts.profile, error: null }),
            }),
          }),
        };
      }
      if (table === 'usage_counters') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: opts.usage ?? null, error: null }),
            }),
          }),
        };
      }
      if (table === 'listings') {
        return { insert: mockListingInsert };
      }
      if (table === 'pipeline') {
        return { insert: mockPipelineInsert };
      }
      return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) };
    },
  };
  return { client, mockRpc, mockListingInsert, mockPipelineInsert };
}

function makeReq(body: object): Request {
  return new Request('http://localhost/api/intake', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function mockClaudeOk() {
  mockMessagesCreate.mockResolvedValueOnce({
    content: [{ type: 'text', text: JSON.stringify({
      title: 'SWE', company: 'Acme', score: 4.2,
      dimensions: { A:4,B:4,C:4,D:4,E:4,F:4 },
      summary: 'Good fit', key_gaps: ['gap1'], recommendation: 'apply',
    }) }],
  });
}

beforeEach(() => {
  mockCreateClient.mockReset();
  mockMessagesCreate.mockReset();
  process.env.ANTHROPIC_API_KEY = 'sk-server-test';
});

describe('POST /api/intake — atomic eval gate', () => {
  it('allows free user at eval 4 (rpc returns 5) and returns 201 with evalsRemaining=0', async () => {
    const { client, mockRpc } = makeClient({
      authUser: { id: 'u1' },
      profile: { cv_text: 'My CV', anthropic_api_key_encrypted: null, is_pro: false },
      rpcReturn: 5,
    });
    mockCreateClient.mockResolvedValueOnce(client);
    mockClaudeOk();

    const res = await POST(makeReq({ url: 'https://example.com/jobs/1', jdText: 'JD text here' }));
    expect(res.status).toBe(201);
    expect(mockRpc).toHaveBeenCalledTimes(1);
    expect(mockRpc).toHaveBeenCalledWith('increment_eval_count', { p_user_id: 'u1', p_limit: 5 });
    const body = await res.json();
    expect(body.evalsRemaining).toBe(0);
  });

  it('blocks free user at limit (rpc returns null) with 429 and upgradeRequired=true', async () => {
    const { client, mockRpc, mockListingInsert, mockPipelineInsert } = makeClient({
      authUser: { id: 'u1' },
      profile: { cv_text: 'My CV', anthropic_api_key_encrypted: null, is_pro: false },
      usage: { eval_count: 5 },
      rpcReturn: null,
    });
    mockCreateClient.mockResolvedValueOnce(client);

    const res = await POST(makeReq({ url: 'https://example.com/jobs/1', jdText: 'JD text here' }));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.upgradeRequired).toBe(true);
    expect(body.limit).toBe(5);
    expect(body.count).toBe(5);

    // Claude and downstream inserts must NOT run when blocked.
    expect(mockMessagesCreate).not.toHaveBeenCalled();
    expect(mockListingInsert).not.toHaveBeenCalled();
    expect(mockPipelineInsert).not.toHaveBeenCalled();
    expect(mockRpc).toHaveBeenCalledTimes(1);
  });

  it('skips the RPC entirely for BYOK users (anthropic_api_key_encrypted truthy)', async () => {
    const { client, mockRpc } = makeClient({
      authUser: { id: 'u1' },
      profile: { cv_text: 'My CV', anthropic_api_key_encrypted: 'sk-ant-user', is_pro: true },
      rpcReturn: 999, // would block if ever called
    });
    mockCreateClient.mockResolvedValueOnce(client);
    mockClaudeOk();

    const res = await POST(makeReq({ url: 'https://example.com/jobs/1', jdText: 'JD text here' }));
    expect(res.status).toBe(201);
    expect(mockRpc).not.toHaveBeenCalled();
    const body = await res.json();
    expect(body.evalsRemaining).toBeNull();
  });

  it('returns 400 with no-CV error before touching the eval gate', async () => {
    const { client, mockRpc } = makeClient({
      authUser: { id: 'u1' },
      profile: { cv_text: null, anthropic_api_key_encrypted: null, is_pro: false },
      rpcReturn: 1,
    });
    mockCreateClient.mockResolvedValueOnce(client);

    const res = await POST(makeReq({ url: 'https://example.com/jobs/1', jdText: 'JD text here' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/No CV found/);
    expect(mockRpc).not.toHaveBeenCalled();
  });
});
