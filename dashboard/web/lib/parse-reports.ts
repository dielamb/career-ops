import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { ReportSchema, type Report, type ParseError } from './schemas';

const FILENAME_RE = /^(\d{3})-(.+)-(\d{4}-\d{2}-\d{2})\.md$/;
const HEADER_RE = /^\*\*(Score|URL|PDF|Legitimacy|Date):\*\*\s*(.+)$/gm;
const BLOCK_RE = /^\|\s*(?:\*\*)?([A-F])(?:\s*[—–-]\s*[^|]+?)?(?:\*\*)?\s*\|\s*(?:\*\*)?([\d.]+)(?:\*\*)?\s*\|\s*(.*?)\s*\|$/gm;
const TITLE_RE = /^# (.+)$/m;
const BLOCKS_SECTION_RE = /^## Blocks\s*\n([\s\S]*?)(?=^## |\Z)/m;

type BlockKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export async function parseReports(
  reportsDir: string,
  outputDir?: string,
): Promise<{ data: Report[]; errors: ParseError[] }> {
  const data: Report[] = [];
  const errors: ParseError[] = [];

  let files: string[];
  try {
    files = await fs.readdir(reportsDir);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { data: [], errors: [{ row: 0, raw: reportsDir, reason: 'Directory not found: ' + msg }] };
  }

  const mdFiles = files.filter(f => f.endsWith('.md')).sort();
  let rowIndex = 0;

  for (const filename of mdFiles) {
    rowIndex++;
    const filePath = path.join(reportsDir, filename);

    try {
      const nameMatch = filename.match(FILENAME_RE);
      if (!nameMatch) {
        errors.push({ row: rowIndex, raw: filename, reason: `Filename does not match NNN-slug-YYYY-MM-DD.md pattern` });
        continue;
      }

      const num = parseInt(nameMatch[1], 10);
      const slug = nameMatch[2];
      const date = nameMatch[3];

      const raw = await fs.readFile(filePath, 'utf8');
      const { content } = matter(raw);

      // Extract title from first H1
      const titleMatch = content.match(TITLE_RE);
      const title = titleMatch ? titleMatch[1].trim() : '';

      // Extract header key-value pairs
      const headers: Record<string, string> = {};
      HEADER_RE.lastIndex = 0;
      let hm: RegExpExecArray | null;
      while ((hm = HEADER_RE.exec(content)) !== null) {
        headers[hm[1]] = hm[2].trim();
      }

      // Parse Score
      const scoreRaw = headers['Score'] ? headers['Score'].replace('/5', '').trim() : '';
      const score = parseFloat(scoreRaw);
      if (isNaN(score)) throw new Error(`Invalid Score value: "${headers['Score']}"`);

      // Parse URL (nullable)
      const url = headers['URL'] || null;

      // Parse PDF flag from header
      let pdf = headers['PDF'] === '✅';

      // Parse Legitimacy (nullable)
      const legitimacy = headers['Legitimacy'] || null;

      // Extract ## Blocks section and parse rows A-F
      const blocks: Report['blocks'] = { A: null, B: null, C: null, D: null, E: null, F: null };
      const blocksMatch = content.match(BLOCKS_SECTION_RE);
      if (blocksMatch) {
        const blocksSection = blocksMatch[1];
        BLOCK_RE.lastIndex = 0;
        let bm: RegExpExecArray | null;
        while ((bm = BLOCK_RE.exec(blocksSection)) !== null) {
          const key = bm[1] as BlockKey;
          const blockScore = parseFloat(bm[2]);
          const notes = bm[3].trim();
          if (!isNaN(blockScore)) {
            blocks[key] = { score: blockScore, notes };
          }
        }
      }

      // Body: content after ## Blocks section (or full content if no Blocks)
      let body: string;
      const blocksHeadIdx = content.indexOf('## Blocks');
      if (blocksHeadIdx !== -1) {
        // Find next ## heading after Blocks
        const afterBlocks = content.indexOf('\n## ', blocksHeadIdx + 1);
        body = afterBlocks !== -1 ? content.slice(afterBlocks).trim() : '';
      } else {
        body = content.trim();
      }

      // PDF companion override: check if {num}.pdf exists in outputDir
      if (outputDir !== undefined) {
        const pdfFile = path.join(outputDir, `${String(num).padStart(3, '0')}.pdf`);
        try {
          await fs.access(pdfFile);
          pdf = true; // companion found — override header
        } catch {
          // No companion — keep header value
        }
      }

      const obj = { num, slug, date, title, score, url, pdf, legitimacy, blocks, body };
      const parsed = ReportSchema.parse(obj);
      data.push(parsed);
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      errors.push({ row: rowIndex, raw: filename, reason });
    }
  }

  return { data, errors };
}
