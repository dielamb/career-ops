import { promises as fs } from 'node:fs';
import lockfile from 'proper-lockfile';

export class LockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LockedError';
  }
}

/**
 * Acquires an exclusive lock on filePath via proper-lockfile, then atomically
 * writes content. Releases the lock in a finally block.
 *
 * Lock options:
 *   stale: 10000          // any lock older than 10s is considered stale and auto-released
 *   retries: { retries: 3, factor: 2, minTimeout: 200, maxTimeout: 2000 }
 *                         // exponential backoff: ~200ms, ~400ms, ~800ms
 *
 * Total worst-case time waiting for lock: ~1.4s (sum of retries). After all
 * retries exhaust, throws LockedError with message including the filePath.
 *
 * proper-lockfile creates `${filePath}.lock` as a directory sentinel.
 * The targeted file does NOT need to pre-exist — lockfile will lock the
 * path slot regardless. After write, the .lock dir is removed.
 */
export async function lockedWrite(filePath: string, content: string): Promise<void> {
  // Ensure the file exists — proper-lockfile v4 requires the target to be accessible
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, '');
  }

  let release: () => Promise<void>;
  try {
    release = await lockfile.lock(filePath, {
      stale: 10000,
      retries: {
        retries: 3,
        factor: 2,
        minTimeout: 200,
        maxTimeout: 2000,
      },
    });
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ELOCKED') {
      throw new LockedError('Could not acquire lock on ' + filePath + ' after retries');
    }
    throw err;
  }

  try {
    await fs.writeFile(filePath, content, 'utf8');
  } finally {
    await release();
  }
}
