import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabase: vi.fn(),
}));

import { GET } from '@/app/api/applications/route';
import { createServerSupabase } from '@/lib/supabase-server';

const mockCreateClient = createServerSupabase as unknown as ReturnType<typeof vi.fn>;

const FIXTURE_APP = {
  id: 'uuid-1', user_id: 'user-uuid', pipeline_id: null,
  company: 'Acme', role: 'SWE',
  submitted_at: '2026-05-20T00:00:00Z', notes: '', created_at: '2026-05-20T00:00:00Z',
};

function makeClient(data: unknown[], error: null | { message: string } = null) {
  return { from: () => ({ select: () => ({ order: () => Promise.resolve({ data: error ? null : data, error }) }) }) };
}

describe('GET /api/applications', () => {
  beforeEach(() => { mockCreateClient.mockReset(); });

  it('returns 200 with rows on happy path', async () => {
    mockCreateClient.mockResolvedValueOnce(makeClient([FIXTURE_APP]));
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].company).toBe('Acme');
    expect(body.errors).toEqual([]);
  });

  it('returns 200 with empty array when no rows', async () => {
    mockCreateClient.mockResolvedValueOnce(makeClient([]));
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
  });
});
