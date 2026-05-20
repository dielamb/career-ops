import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/parse-pipeline', () => ({
  parsePipeline: vi.fn(),
}));

import { GET } from '@/app/api/pipeline/route';
import { parsePipeline } from '@/lib/parse-pipeline';

const mockParse = parsePipeline as unknown as ReturnType<typeof vi.fn>;

const FIXTURE_ENTRY = {
  state: 'evaluated' as const, num: 1,
  url: 'https://example.com/job', company: 'Acme', title: 'SWE',
  score: 4.2, pdf: true, note: null,
};

describe('GET /api/pipeline', () => {
  beforeEach(() => { mockParse.mockReset(); });

  it('returns 200 with parsed pipeline entries on happy path', async () => {
    mockParse.mockResolvedValueOnce({ data: [FIXTURE_ENTRY], errors: [] });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/application\/json/);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].company).toBe('Acme');
    expect(body.errors).toEqual([]);
  });

  it('passes through parser errors with 200 status (malformed-row passthrough)', async () => {
    mockParse.mockResolvedValueOnce({
      data: [FIXTURE_ENTRY],
      errors: [{ row: 5, raw: '- [x] no-url', reason: 'Missing URL in pipeline entry' }],
    });
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.errors).toHaveLength(1);
    expect(body.errors[0].reason).toBe('Missing URL in pipeline entry');
  });
});
