import path from 'node:path';
import { promises as fs } from 'node:fs';
import { NextRequest } from 'next/server';
import { parseReports } from '@/lib/parse-reports';
import { reportsDir, outputDir } from '@/lib/api-paths';
import { jsonOk, jsonError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/**
 * Resolve id (either "{num}-{slug}-{date}" or just "{slug}" or just "{num}") to a Report.
 * id comes from URL params — already decoded by Next.js.
 */
function matchesId(report: { num: number; slug: string; date: string }, id: string): boolean {
  const fullId = `${String(report.num).padStart(3, '0')}-${report.slug}-${report.date}`;
  return id === fullId || id === report.slug || id === String(report.num);
}

export async function GET(
  _req: NextRequest | Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const { data } = await parseReports(reportsDir(), outputDir());
  const report = data.find(r => matchesId(r, id));

  if (!report) {
    return jsonError(404, 'Listing not found');
  }

  // Resolve PDF companion path (or null if missing).
  const pdfCandidate = path.join(outputDir(), `${String(report.num).padStart(3, '0')}.pdf`);
  let pdfPath: string | null = null;
  try {
    await fs.access(pdfCandidate);
    pdfPath = pdfCandidate;
  } catch {
    pdfPath = null;
  }

  return jsonOk({ report, pdfPath });
}
