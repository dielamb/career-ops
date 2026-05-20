import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { parsePipeline } from '../parse-pipeline';

const FIXTURES = path.join(__dirname, 'fixtures');

describe('parsePipeline', () => {
  it('happy — 5 mixed-state items parsed, states correct', async () => {
    const result = await parsePipeline(path.join(FIXTURES, 'pipeline-happy.md'));
    expect(result.errors).toHaveLength(0);
    expect(result.data).toHaveLength(5);

    // First [x] entry
    const first = result.data[0];
    expect(first.state).toBe('evaluated');
    expect(first.num).toBe(50);
    expect(first.url).toContain('ashbyhq.com');
    expect(first.company).toBe('Quora (Poe)');
    expect(first.score).toBe(4.2);
    expect(first.pdf).toBe(false);
  });

  it('empty file — heading + comment only → data=[], errors=[]', async () => {
    const result = await parsePipeline(path.join(FIXTURES, 'pipeline-empty.md'));
    expect(result.data).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it('missing file — returns data=[], errors.length=1', async () => {
    const missingPath = `/tmp/does-not-exist-pipeline-${Date.now()}.md`;
    const result = await parsePipeline(missingPath);
    expect(result.data).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].reason.toLowerCase()).toMatch(/not found|enoent/);
  });

  it('malformed row — missing URL → row skipped + error recorded, others parsed', async () => {
    const result = await parsePipeline(path.join(FIXTURES, 'pipeline-malformed-row.md'));
    expect(result.data).toHaveLength(3);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].reason).toMatch(/url/i);
  });

  it('state mapping — all 4 states (evaluated/skipped/error/pending) present', async () => {
    const result = await parsePipeline(path.join(FIXTURES, 'pipeline-happy.md'));
    const states = result.data.map(e => e.state);
    expect(states).toContain('evaluated');
    expect(states).toContain('skipped');
    expect(states).toContain('error');
    expect(states).toContain('pending');
  });
});
