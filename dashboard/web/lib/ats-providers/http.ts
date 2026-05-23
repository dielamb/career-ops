// Tiny HTTP helper shared across ATS provider fetchers.
// Keeps a 10s default timeout (job boards APIs are usually <1s) and a
// pinned user-agent so providers can rate-limit by client identity.

const DEFAULT_TIMEOUT_MS = 10_000;
const USER_AGENT = 'career-ops-dashboard/0.2 (+https://github.com/dielamb/career-ops)';

export async function fetchJson<T = unknown>(
  url: string,
  opts: { timeoutMs?: number; redirect?: RequestRedirect } = {},
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: opts.redirect ?? 'follow',
      headers: { 'user-agent': USER_AGENT, accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} fetching ${url}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}
