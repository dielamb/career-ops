/**
 * Build a sanitized env for spawning `claude -p` from inside the dashboard.
 *
 * Strips:
 *   - ANTHROPIC_API_KEY — forces subscription (Max) auth via ~/.claude/ tokens.
 *     Without stripping, claude CLI uses API billing which fails for sub users.
 *   - CLAUDECODE, CLAUDE_CODE_* — when the dev server is itself launched from
 *     a Claude Code session (e.g. an agent terminal), these vars leak into the
 *     spawned child. The CLI detects them and either no-ops or exits silently,
 *     leaving a 0-byte log file. Stripping restores standalone behavior.
 *
 * Equivalent to: `env -u ANTHROPIC_API_KEY -u CLAUDECODE ... claude -p "..."`.
 */
export function cleanClaudeEnv(parent: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...parent };
  delete env.ANTHROPIC_API_KEY;
  delete env.CLAUDECODE;
  for (const key of Object.keys(env)) {
    if (key.startsWith('CLAUDE_CODE_')) delete env[key];
  }
  return env;
}
