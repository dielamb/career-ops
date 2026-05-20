import { spawn, type ChildProcess } from 'node:child_process';
import { statSync } from 'node:fs';

export class InvalidUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidUrlError';
  }
}

// Shell metacharacters to reject — defense-in-depth even though array-form spawn
// prevents shell interpretation. These characters have no place in legitimate URLs.
const FORBIDDEN_CHARS = ['`', '$(', ';', '&', '|', '>', '<', "$'"];

/**
 * Validates a URL: throws InvalidUrlError if invalid.
 * Rules:
 *   1. Must parse via `new URL(url)` (well-formed)
 *   2. Protocol must be exactly 'http:' OR 'https:'
 *   3. Raw string must NOT contain any shell metacharacter
 */
export function validateUrl(url: string): void {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    throw new InvalidUrlError('Malformed URL: ' + url);
  }

  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new InvalidUrlError('Disallowed protocol: ' + u.protocol);
  }

  for (const ch of FORBIDDEN_CHARS) {
    if (url.includes(ch)) {
      throw new InvalidUrlError('URL contains forbidden shell metacharacter: ' + ch);
    }
  }
}

export const BROWSE_BIN = '/Users/michalmaciejewski/.claude/skills/gstack/browse/dist/browse';

/**
 * Spawns `gstack browse` (headed) with the URL. Returns the ChildProcess.
 * Calls validateUrl(url) FIRST — does not spawn on rejection.
 * Uses spawn(cmd, [url]) array form; shell: false is enforced explicitly.
 */
export function openInBrowse(url: string): ChildProcess {
  validateUrl(url);
  return spawn(BROWSE_BIN, ['goto', url], { stdio: 'ignore', detached: false, shell: false });
}

/**
 * Spawns a Node script via `node <scriptPath> [...args]`.
 * Throws if scriptPath does not exist (fs.statSync check before spawn).
 * Uses spawn('node', [scriptPath, ...args]) array form.
 */
export function spawnMjs(scriptPath: string, args: string[] = []): ChildProcess {
  try {
    statSync(scriptPath);
  } catch (originalErr) {
    throw new Error(
      'Script not found: ' + scriptPath + ' (' + (originalErr as Error).message + ')'
    );
  }
  return spawn('node', [scriptPath, ...args], { stdio: 'inherit', shell: false });
}
