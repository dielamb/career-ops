import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/parse-reports', () => ({
  parseReports: vi.fn(),
}));
vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  return {
    ...actual,
    promises: {
      ...actual.promises,
      access: vi.fn(),
    },
  };
});

import { GET } from '@/app/api/listing/[id]/route';
import { parseReports } from '@/lib/parse-reports';
import { promises as fs } from 'node:fs';

const mockParse = parseReports as unknown as ReturnType<typeof vi.fn>;
const mockAccess = fs.access as unknown as ReturnType<typeof vi.fn>;

const FIXTURE_REPORT = {
  num: 1, slug: 'fever', date: '2026-05-20',
  title: 'Fever — Senior Engineer',
  score: 4.58, url: 'https://fever.com/jobs/1',
  pdf: true, legitimacy: 'verified',
  blocks: { A: null, B: null, C: null, D: null, E: null, F: null },
  body: '',
};

describe('GET /api/listing/[id]', () => {
  beforeEach(() => { mockParse.mockReset(); mockAccess.mockReset(); });

  it('returns 200 + { report, pdfPath } when id matches a report', async () => {
    mockParse.mockResolvedValueOnce({ data: [FIXTURE_REPORT], errors: [] });
    mockAccess.mockResolvedValueOnce(undefined); // pdf exists
    const ctx = { params: Promise.resolve({ id: '001-fever-2026-05-20' }) };
    const res = await GET(new Request('http://localhost/api/listing/001-fever-2026-05-20'), ctx);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.report.slug).toBe('fever');
    expect(body.pdfPath).toMatch(/output\/001\.pdf$/);
  });

  it('returns 404 + { error } when id has no matching report', async () => {
    mockParse.mockResolvedValueOnce({ data: [], errors: [] });
    const ctx = { params: Promise.resolve({ id: '999-missing-2026-05-20' }) };
    const res = await GET(new Request('http://localhost/api/listing/999-missing-2026-05-20'), ctx);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Listing not found');
  });
});
