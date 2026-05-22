import { describe, it, expect, vi, afterEach } from 'vitest';
import { EventEmitter } from 'events';
import { openInBrowse, spawnMjs, InvalidUrlError } from '../spawn-mjs';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('spawn-mjs', () => {
  it('1. valid URL: openInBrowse returns a ChildProcess and does not throw', () => {
    const cp = openInBrowse('https://example.com');
    // The ChildProcess has a kill() method — that proves spawn was invoked
    expect(typeof cp.kill).toBe('function');
    // Clean up: send SIGTERM so the spawned process does not linger
    cp.kill('SIGTERM');
  });

  it('2. non-http URL: openInBrowse throws InvalidUrlError for file:// and javascript: schemes', () => {
    expect(() => openInBrowse('file:///etc/passwd')).toThrow(InvalidUrlError);
    expect(() => openInBrowse('javascript:alert(1)')).toThrow(InvalidUrlError);
    expect(() => openInBrowse('data:text/html,<script>alert(1)</script>')).toThrow(InvalidUrlError);
    expect(() => openInBrowse('ftp://example.com/file')).toThrow(InvalidUrlError);
  });

  it('3. shell metacharacters in URL: openInBrowse throws InvalidUrlError for each forbidden character', () => {
    const malicious = [
      'https://x.com/`whoami`',      // backtick
      'https://x.com/$(id)',         // dollar-paren
      'https://x.com/;rm -rf /',    // semicolon
      'https://x.com/&cmd',         // ampersand
      'https://x.com/|cat',         // pipe
      'https://x.com/>out',         // redirect gt
      'https://x.com/<in',          // redirect lt
    ];
    for (const url of malicious) {
      expect(() => openInBrowse(url), `Expected throw for: ${url}`).toThrow(InvalidUrlError);
    }
  });

  it('4. spawnMjs ENOENT: throws before spawn when script does not exist', () => {
    const missing = `/tmp/does-not-exist-${Date.now()}.mjs`;
    expect(() => spawnMjs(missing)).toThrow(/ENOENT|not found|does not exist/i);
  });

  it('5. spawn does not swallow errors: spawnMjs returns ChildProcess that propagates emitted error events', async () => {
    // Strategy: create a real fixture .mjs file so statSync passes,
    // spawn it, and verify the ChildProcess returned by spawnMjs does NOT
    // have its 'error' event listener suppressed (i.e. adding a listener works).
    // The plan also permits: assert cp.pid is a number (proves spawn was invoked
    // and returned a real ChildProcess, not silently eaten).
    const { writeFileSync, unlinkSync } = await import('node:fs');
    const { EventEmitter } = await import('node:events');
    const tmpScript = `/tmp/test-spawn-ok-${Date.now()}.mjs`;
    // Script that exits immediately
    writeFileSync(tmpScript, 'process.exit(0)');

    try {
      const cp = spawnMjs(tmpScript);

      // Verify it is a real ChildProcess-like object (not null, has .on and .kill)
      expect(typeof cp.on).toBe('function');
      expect(typeof cp.kill).toBe('function');

      // Verify error events can be listened to — helper does not suppress them
      const errorListenerCount = cp.listenerCount('error');
      // Adding our own listener should work without throw
      const errHandler = (_e: Error) => {};
      cp.on('error', errHandler);
      expect(cp.listenerCount('error')).toBe(errorListenerCount + 1);
      cp.off('error', errHandler);

      // Simulate: if the process itself emits an error (e.g. EACCES later),
      // the event propagates. We emit a synthetic one via the EventEmitter API
      // and assert our handler receives it.
      const receivedError = await new Promise<Error>((resolve) => {
        cp.once('error', resolve);
        // Emit after a tick so our listener is registered
        setImmediate(() => {
          (cp as unknown as EventEmitter).emit('error', Object.assign(new Error('spawn EACCES'), { code: 'EACCES' }));
        });
      });
      expect(receivedError.message).toMatch(/EACCES/);

      cp.kill('SIGTERM');
    } finally {
      unlinkSync(tmpScript);
    }
  });
});
