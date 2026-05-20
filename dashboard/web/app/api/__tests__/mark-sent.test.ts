import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/git-commit', async () => {
  const actual = await vi.importActual<typeof import('@/lib/git-commit')>('@/lib/git-commit');
  return {
    ...actual,
    lockedWrite: vi.fn(),
  };
});
vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  return {
    ...actual,
    promises: {
      ...actual.promises,
      readFile: vi.fn(),
    },
  };
});

import { POST } from '@/app/api/actions/mark-sent/route';
import { lockedWrite, LockedError } from '@/lib/git-commit';
import { promises as fs } from 'node:fs';

const mockWrite = lockedWrite as unknown as ReturnType<typeof vi.fn>;
const mockRead = fs.readFile as unknown as ReturnType<typeof vi.fn>;

const FIXTURE_MD = [
  '# Applications',
  '',
  '| # | Date | Company | Role | Score | Status | PDF | Report | Notes |',
  '|---|------|---------|------|-------|--------|-----|--------|-------|',
  '| 1 | 2026-05-20 | Acme | SWE | 4.5/5 | Evaluated | ✅ | [report](reports/001-acme.md) | first |',
  '| 2 | 2026-05-19 | Beta | PM | 3.0/5 | Rejected | ❌ |  | second |',
  '',
].join('\n');

function makeReq(body: unknown): Request {
  return new Request('http://localhost/api/actions/mark-sent', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/actions/mark-sent', () => {
  beforeEach(() => {
    mockWrite.mockReset();
    mockRead.mockReset();
  });

  it('rewrites the matching row status, calls lockedWrite, returns 200', async () => {
    mockRead.mockResolvedValueOnce(FIXTURE_MD);
    mockWrite.mockResolvedValueOnce(undefined);
    const res = await POST(makeReq({ id: '1', status: 'Applied' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.applied.id).toBe('1');
    expect(body.applied.status).toBe('Applied');
    expect(typeof body.applied.ts).toBe('string');

    expect(mockWrite).toHaveBeenCalledTimes(1);
    const writtenContent = mockWrite.mock.calls[0][1] as string;
    // Row 1 status changed to Applied:
    expect(writtenContent).toMatch(/\| 1 \| 2026-05-20 \| Acme \| SWE \| 4\.5\/5 \| Applied \|/);
    // Row 2 untouched:
    expect(writtenContent).toMatch(/\| 2 \| 2026-05-19 \| Beta \| PM \| 3\.0\/5 \| Rejected \|/);
  });

  it('returns 423 { error: "Locked" } when lockedWrite throws LockedError', async () => {
    mockRead.mockResolvedValueOnce(FIXTURE_MD);
    mockWrite.mockRejectedValueOnce(new LockedError('Could not acquire lock'));
    const res = await POST(makeReq({ id: '1', status: 'Applied' }));
    expect(res.status).toBe(423);
    const body = await res.json();
    expect(body.error).toBe('Locked');
  });
});
