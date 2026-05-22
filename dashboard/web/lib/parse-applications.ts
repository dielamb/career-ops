import { promises as fs } from 'node:fs';
import { ApplicationSchema, type Application, type ParseError } from './schemas';

export async function parseApplications(
  path: string,
): Promise<{ data: Application[]; errors: ParseError[] }> {
  const data: Application[] = [];
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
    const trimmed = line.trim();
    // Only process lines that look like table data rows
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) continue;
    // Skip header row (contains "| # |") and separator row (contains "|---|")
    if (trimmed.includes('| # |') || trimmed.includes('|---|')) continue;

    rowIndex++;
    try {
      // Split by | and trim each cell; first/last are empty due to leading/trailing |
      const cells = trimmed.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
      if (cells.length < 9) {
        errors.push({ row: rowIndex, raw: line, reason: `Expected 9 cells, got ${cells.length}` });
        continue;
      }

      const [numStr, date, company, role, scoreStr, status, pdfCell, reportCell, ...notesParts] = cells;
      const notes = notesParts.join(' | ');

      const num = parseInt(numStr, 10);
      if (isNaN(num)) throw new Error(`Invalid num: "${numStr}"`);

      const scoreRaw = scoreStr.replace('/5', '').trim();
      const score = scoreRaw === '' ? null : parseFloat(scoreRaw);
      if (scoreRaw !== '' && isNaN(score as number)) throw new Error(`Invalid score: "${scoreStr}"`);

      const pdf = pdfCell === '✅';

      const reportMatch = reportCell.match(/\[\d+\]\(([^)]+)\)/);
      const reportPath = reportMatch ? reportMatch[1] : null;

      const obj = { num, date, company, role, score, status, pdf, reportPath, notes };
      const parsed = ApplicationSchema.parse(obj);
      data.push(parsed);
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      errors.push({ row: rowIndex, raw: line, reason });
    }
  }

  return { data, errors };
}
