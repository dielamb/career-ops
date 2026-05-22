import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import lockfile from 'proper-lockfile';
import { lockedWrite, LockedError } from '../git-commit';

let tmpDir: string;
let tmpFile: string;
let manualRelease: (() => Promise<void>) | null = null;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gco-'));
  tmpFile = path.join(tmpDir, 'target.md');
  // proper-lockfile needs the file to exist before locking
  await fs.writeFile(tmpFile, '');
  manualRelease = null;
});

afterEach(async () => {
  // Release any manually-held lock so subsequent cleanup doesn't hang
  if (manualRelease) {
    try {
      await manualRelease();
    } catch {
      // ignore — lock may already be released
    }
    manualRelease = null;
  }
  // Remove tmpdir
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe('git-commit lockedWrite', () => {
  it('1. happy path: writes content and releases lock', async () => {
    await lockedWrite(tmpFile, 'hello');
    const content = await fs.readFile(tmpFile, 'utf8');
    expect(content).toBe('hello');

    // Lock directory must be cleaned up after write
    const lockDir = tmpFile + '.lock';
    let lockExists = false;
    try {
      await fs.access(lockDir);
      lockExists = true;
    } catch {
      lockExists = false;
    }
    expect(lockExists).toBe(false);
  });

  it('2. contention retry: succeeds after a competing lock is released (~150ms)', async () => {
    // Acquire lock manually; release after 150ms
    const release = await lockfile.lock(tmpFile, { stale: 60000 });
    manualRelease = release;
    setTimeout(() => {
      release().then(() => { manualRelease = null; }).catch(() => {});
    }, 150);

    // lockedWrite should retry and eventually succeed
    await lockedWrite(tmpFile, 'B');
    expect(await fs.readFile(tmpFile, 'utf8')).toBe('B');
  }, 5000);

  it('3. stale-lock recovery: proper-lockfile removes stale lock and write succeeds', async () => {
    // Acquire lock (don't release — simulating a crashed writer)
    const release = await lockfile.lock(tmpFile, { stale: 60000 });
    manualRelease = release;

    // Back-date the .lock directory to 15 seconds ago (> stale: 10000)
    const lockDir = tmpFile + '.lock';
    const past = new Date(Date.now() - 15000);
    await fs.utimes(lockDir, past, past);

    // lockedWrite should detect stale lock and succeed
    await lockedWrite(tmpFile, 'C');
    expect(await fs.readFile(tmpFile, 'utf8')).toBe('C');

    // After lockedWrite succeeded with stale recovery, the original manual release
    // may throw (lock was already broken). Clear it to avoid afterEach error.
    manualRelease = null;
  });

  it('4. acquisition timeout: throws LockedError when lock is held throughout retries', async () => {
    // Hold the lock for the entire test duration (stale: 60s so it won't be evicted)
    const held = await lockfile.lock(tmpFile, { stale: 60000 });
    manualRelease = held;

    // lockedWrite retries 3x with exponential backoff (~200+400+800ms = ~1.4s total)
    // then exhausts and must throw LockedError
    await expect(lockedWrite(tmpFile, 'D')).rejects.toThrow(LockedError);
  }, 10000);
});
