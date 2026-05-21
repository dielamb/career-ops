import { promises as fs } from 'node:fs';

/** Returns a Map<url, first_seen (YYYY-MM-DD)> from data/scan-history.tsv */
export async function parseScanHistoryByUrl(tsvPath: string): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  let content: string;
  try {
    content = await fs.readFile(tsvPath, 'utf8');
  } catch {
    return out;
  }
  const lines = content.split('\n');
  for (const line of lines.slice(1)) { // skip header
    if (!line.trim()) continue;
    const cols = line.split('\t');
    const url = cols[0]?.trim();
    const firstSeen = cols[1]?.trim();
    if (url && firstSeen) out.set(url, firstSeen);
  }
  return out;
}
