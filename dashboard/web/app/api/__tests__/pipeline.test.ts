import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabase: vi.fn(),
}));

import { GET } from '@/app/api/pipeline/route';
import { createServerSupabase } from '@/lib/supabase-server';

const mockCreateClient = createServerSupabase as unknown as ReturnType<typeof vi.fn>;

const FIXTURE_ROW = {
  id: 'uuid-1', user_id: 'user-uuid', listing_id: null,
  url: 'https://example.com/job', company: 'Acme', title: 'SWE',
  score: 4.2, dimension_scores: null, gap_analysis: null,
  status: 'evaluated', pdf_path: null, notes: null, eval_date: null,
  created_at: '2026-05-20T00:00:00Z', updated_at: '2026-05-20T00:00:00Z',
};

function makeClient(data: unknown[], error: null | { message: string } = null) {
  return { from: () => ({ select: () => ({ order: () => Promise.resolve({ data: error ? null : data, error }) }) }) };
}

describe('GET /api/pipeline', () => {
  beforeEach(() => { mockCreateClient.mockReset(); });

  it('returns 200 with pipeline rows on happy path', async () => {
    mockCreateClient.mockResolvedValueOnce(makeClient([FIXTURE_ROW]));
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
