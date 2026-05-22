import { promises as fs } from 'node:fs';
import { PipelineEntrySchema, type PipelineEntry, type ParseError } from './schemas';

const STATE_MAP: Record<string, PipelineEntry['state']> = {
  x: 'evaluated',
  s: 'skipped',
  '!': 'error',
  ' ': 'pending',
};

export async function parsePipeline(
  path: string,
): Promise<{ data: PipelineEntry[]; errors: ParseError[] }> {
  const data: PipelineEntry[] = [];
  const errors: ParseError[] = [];

  let content: string;
  try {
    content = await fs.readFile(path, 'utf8');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { data: [], errors: [{ row: 0, raw: path, reason: 'File not found: ' + msg }] };
  }

  const lines = content.split('\n');
  let rowIndex = 0;

  for (const line of lines) {
    // Only process lines with checkbox syntax
    const match = line.match(/^- \[([x s!])\] (.+)$/);
    if (!match) continue;

    rowIndex++;
    const stateChar = match[1];
    const body = match[2];
    const state = STATE_MAP[stateChar];

    try {
      const tokens = body.split(' | ');
      let idx = 0;

      // Optional #NNN token
      let num: number | null = null;
      if (tokens[idx] && /^#(\d+)$/.test(tokens[idx].trim())) {
        num = parseInt(tokens[idx].trim().slice(1), 10);
        idx++;
      }

      // URL is REQUIRED
      const urlToken = tokens[idx] ? tokens[idx].trim() : '';
      if (!urlToken.match(/^https?:\/\//)) {
        errors.push({ row: rowIndex, raw: line, reason: `Missing URL in pipeline entry` });
        continue;
      }
      const url = urlToken;
      idx++;

      let company: string | null = null;
      let title: string | null = null;
      let score: number | null = null;
      let pdf: boolean | null = null;
      let note: string | null = null;

      if (state === 'evaluated') {
        company = tokens[idx] ? tokens[idx].trim() : null;
        idx++;
        title = tokens[idx] ? tokens[idx].trim() : null;
        idx++;
        // Score token: "N.N/5" or "N/5"
        const scoreToken = tokens[idx] ? tokens[idx].trim() : '';
        if (scoreToken.match(/^[\d.]+\/5$/)) {
          score = parseFloat(scoreToken.replace('/5', ''));
          idx++;
        }
        // PDF indicator token: "PDF ✅" or "PDF ❌"
        const pdfToken = tokens[idx] ? tokens[idx].trim() : '';
        if (pdfToken.startsWith('PDF')) {
          pdf = pdfToken.includes('✅');
          idx++;
        }
      } else if (state === 'skipped' || state === 'error' || state === 'pending') {
        // Best-effort: next token is company, then title, rest goes to note
        company = tokens[idx] ? tokens[idx].trim() : null;
        idx++;
        if (tokens[idx] && !tokens[idx].trim().match(/^(SKIPPED:|Error:)/i)) {
          title = tokens[idx].trim();
          idx++;
        }
        // Remaining tokens become the note
        if (idx < tokens.length) {
          note = tokens.slice(idx).join(' | ').trim();
        }
      }

      const obj = { state, num, url, company, title, score, pdf, note };
      const parsed = PipelineEntrySchema.parse(obj);
      data.push(parsed);
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      errors.push({ row: rowIndex, raw: line, reason });
    }
  }

  return { data, errors };
}
