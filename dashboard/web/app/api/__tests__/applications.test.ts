import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/parse-applications', () => ({
  parseApplications: vi.fn(),
}));

import { GET } from '@/app/api/applications/route';
import { parseApplications } from '@/lib/parse-applications';

const mockParse = parseApplications as unknown as ReturnType<typeof vi.fn>;

const FIXTURE_APP = {
  num: 1, date: '2026-05-20', company: 'Acme', role: 'SWE',
  score: 4.5, status: 'Applied' as const, pdf: true,
  reportPath: 'reports/001-acme-2026-05-20.md', notes: '',
};

describe('GET /api/applications', () => {
  beforeEach(() => { mockParse.mockReset(); });

  it('returns 200 with parsed applications on happy path', async () => {
    mockParse.mockResolvedValueOnce({ data: [FIXTURE_APP], errors: [] });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/application\/json/);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].company).toBe('Acme');
    expect(body.errors).toEqual([]);
  });

  it('passes through parser errors with 200 status (parser handles file-not-found)', async () => {
    mockParse.mockResolvedValueOnce({
      data: [],
      errors: [{ row: 0, raw: '/nope', reason: 'File not found: ENOENT' }],
    });
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
    expect(body.errors).toHaveLength(1);
    expect(body.errors[0].reason).toMatch(/^File not found/);
  });
});
