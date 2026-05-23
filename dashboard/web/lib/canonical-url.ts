/**
 * Canonical form of a job-posting URL for dedup purposes:
 * - lowercase host
 * - drop query string and fragment (most ATS posting URLs are path-based,
 *   so ?ref=foo trackers don't change identity)
 * - drop trailing slash
 *
 * Falls back to the raw input on parse failure so callers never crash.
 */
export function canonicalUrl(raw: string): string {
  try {
    const u = new URL(raw);
    const path = u.pathname.replace(/\/+$/, '') || '/';
    return `${u.protocol}//${u.host.toLowerCase()}${path}`;
  } catch {
    return raw;
  }
}
