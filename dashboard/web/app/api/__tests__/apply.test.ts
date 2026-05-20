import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/spawn-mjs', async () => {
  const actual = await vi.importActual<typeof import('@/lib/spawn-mjs')>('@/lib/spawn-mjs');
  return {
    ...actual,
    openInBrowse: vi.fn(),
    // Keep real InvalidUrlError class so `instanceof` checks in route work.
  };
});

import { POST } from '@/app/api/actions/apply/route';
import { openInBrowse, InvalidUrlError } from '@/lib/spawn-mjs';

const mockOpen = openInBrowse as unknown as ReturnType<typeof vi.fn>;

function makeReq(body: unknown): Request {
  return new Request('http://localhost/api/actions/apply', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/actions/apply', () => {
  beforeEach(() => { mockOpen.mockReset(); });

  it('returns 200 { ok: true } and calls openInBrowse on valid URL', async () => {
    mockOpen.mockReturnValueOnce({ pid: 12345 } as never);
    const res = await POST(makeReq({ url: 'https://example.com/job/1' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(mockOpen).toHaveBeenCalledWith('https://example.com/job/1');
  });

  it('returns 400 { error: "Invalid URL" } when openInBrowse throws InvalidUrlError', async () => {
    mockOpen.mockImplementationOnce(() => {
      throw new InvalidUrlError('Disallowed protocol: javascript:');
    });
    const res = await POST(makeReq({ url: 'javascript:alert(1)' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid URL');
    expect(body.details).toMatch(/Disallowed protocol/);
  });
});
