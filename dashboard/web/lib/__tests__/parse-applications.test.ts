import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import { parseApplications } from '../parse-applications';

const FIXTURES = path.join(__dirname, 'fixtures');

describe('parseApplications', () => {
  it('happy — 3 valid rows parsed correctly', async () => {
    const result = await parseApplications(path.join(FIXTURES, 'applications-happy.md'));
    expect(result.errors).toHaveLength(0);
    expect(result.data).toHaveLength(3);
    const first = result.data[0];
    expect(first.num).toBe(1);
    expect(first.company).toBe('Acme Corp');
    expect(first.score).toBe(4.2);
    expect(first.pdf).toBe(true);
    expect(first.status).toBe('Evaluated');
    expect(first.reportPath).toBe('reports/001-acme-2026-04-01.md');
  });

  it('empty file — only headers, no data rows → data=[], errors=[]', async () => {
    const result = await parseApplications(path.join(FIXTURES, 'applications-empty.md'));
    expect(result.data).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it('missing file — returns data=[], errors length 1 mentioning not found', async () => {
    const missingPath = `/tmp/does-not-exist-${Date.now()}.md`;
    const result = await parseApplications(missingPath);
    expect(result.data).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].reason.toLowerCase()).toMatch(/not found|enoent/);
  });

  it('malformed row — 3 valid rows + 1 bad score → data.length=3, errors.length=1', async () => {
    const result = await parseApplications(path.join(FIXTURES, 'applications-malformed-row.md'));
    expect(result.data).toHaveLength(3);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].row).toBe(4);
  });

  it('schema fail — invalid status drops row and records validation error', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'parse-app-test-'));
    const tmpFile = path.join(tmpDir, 'schema-fail.md');
    const content = [
      '# Applications Tracker',
      '',
      '| # | Date | Company | Role | Score | Status | PDF | Report | Notes |',
      '|---|------|---------|------|-------|--------|-----|--------|-------|',
      '| 1 | 2026-04-01 | Acme | Designer | 4.0/5 | Evaluated | ❌ |  | good row |',
      '| 99 | 2026-05-13 | TestCo | Role | 4.0/5 | InvalidStatus | ❌ |  | bad status |',
    ].join('\n');
    await fs.writeFile(tmpFile, content, 'utf8');

    const result = await parseApplications(tmpFile);
    expect(result.data).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].reason).toMatch(/invalid/i);

    await fs.rm(tmpDir, { recursive: true });
  });
});
