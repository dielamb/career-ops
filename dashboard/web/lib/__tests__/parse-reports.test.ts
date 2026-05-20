import { describe, it, expect, afterEach } from 'vitest';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import { parseReports } from '../parse-reports';

const FIXTURES = path.join(__dirname, 'fixtures');
const HAPPY_CONTENT = fs.readFile(path.join(FIXTURES, 'report-happy.md'), 'utf8');
const MISSING_BLOCKS_CONTENT = fs.readFile(path.join(FIXTURES, 'report-missing-blocks.md'), 'utf8');

const tmpDirs: string[] = [];

async function makeTmpDir(): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'parse-reports-test-'));
  tmpDirs.push(dir);
  return dir;
}

afterEach(async () => {
  for (const dir of tmpDirs.splice(0)) {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

describe('parseReports', () => {
  it('happy — 2 valid reports parsed, each has populated blocks A-F', async () => {
    const tmpDir = await makeTmpDir();
    const happy = await HAPPY_CONTENT;
    await fs.writeFile(path.join(tmpDir, '001-happyco-2026-04-21.md'), happy);
    await fs.writeFile(path.join(tmpDir, '002-happytwo-2026-04-21.md'), happy);

    const result = await parseReports(tmpDir);
    expect(result.errors).toHaveLength(0);
    expect(result.data).toHaveLength(2);

    const report = result.data[0];
    expect(report.num).toBe(1);
    expect(report.score).toBe(4.35);
    expect(report.blocks.A).not.toBeNull();
    expect(report.blocks.A?.score).toBe(4.0);
    expect(report.blocks.F).not.toBeNull();
    expect(report.blocks.F?.score).toBe(4.35);
    expect(report.legitimacy).toBe('High Confidence');
    expect(report.pdf).toBe(false);
  });

  it('missing blocks — report has all blocks A-F null, no errors', async () => {
    const tmpDir = await makeTmpDir();
    const missingBlocksContent = await MISSING_BLOCKS_CONTENT;
    await fs.writeFile(path.join(tmpDir, '010-missingblocks-2026-04-22.md'), missingBlocksContent);

    const result = await parseReports(tmpDir);
    expect(result.errors).toHaveLength(0);
    expect(result.data).toHaveLength(1);

    const report = result.data[0];
    expect(report.blocks.A).toBeNull();
    expect(report.blocks.B).toBeNull();
    expect(report.blocks.C).toBeNull();
    expect(report.blocks.D).toBeNull();
    expect(report.blocks.E).toBeNull();
    expect(report.blocks.F).toBeNull();
  });

  it('no PDF companion — outputDir has no matching pdf, report.pdf uses header value', async () => {
    const tmpDir = await makeTmpDir();
    const emptyOutputDir = await makeTmpDir();
    const happy = await HAPPY_CONTENT;
    await fs.writeFile(path.join(tmpDir, '001-happyco-2026-04-21.md'), happy);

    const result = await parseReports(tmpDir, emptyOutputDir);
    expect(result.errors).toHaveLength(0);
    expect(result.data).toHaveLength(1);
    // Header says PDF: ❌ → false; no companion found → stays false
    expect(result.data[0].pdf).toBe(false);
  });

  it('malformed front-matter — bad score skips row, sibling valid report still parsed', async () => {
    const tmpDir = await makeTmpDir();
    const happy = await HAPPY_CONTENT;
    const badContent = happy.replace('**Score:** 4.35/5', '**Score:** not-a-number/5');
    await fs.writeFile(path.join(tmpDir, '003-bad-2026-04-21.md'), badContent);
    await fs.writeFile(path.join(tmpDir, '004-good-2026-04-21.md'), happy);

    const result = await parseReports(tmpDir);
    expect(result.errors).toHaveLength(1);
    expect(result.data).toHaveLength(1);
    expect(result.errors[0].reason).toMatch(/invalid score/i);
    expect(result.data[0].num).toBe(4);
  });
});
