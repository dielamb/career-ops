import { z } from 'zod';

// ── Application (data/applications.md row) ──────────────────────
/** One row of data/applications.md tracker table */
export const ApplicationSchema = z.object({
  num: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  company: z.string().min(1),
  role: z.string().min(1),
  score: z.number().min(0).max(5).nullable(),
  status: z.enum(['Evaluated', 'Applied', 'Responded', 'Interview', 'Offer', 'Rejected', 'Discarded', 'SKIP']),
  pdf: z.boolean(),
  reportPath: z.string().nullable(),
  notes: z.string(),
});
export type Application = z.infer<typeof ApplicationSchema>;

// ── PipelineEntry (data/pipeline.md checkbox list row) ──────────
// Format: - [x|s|!|space] [#NNN |] {url} | {company} | {title} | {score?} | PDF {emoji}?
// state: 'evaluated' = [x], 'skipped' = [s], 'error' = [!], 'pending' = [ ]
/** One row of data/pipeline.md checkbox list */
export const PipelineEntrySchema = z.object({
  state: z.enum(['evaluated', 'skipped', 'error', 'pending']),
  num: z.number().int().positive().nullable(),
  url: z.string().url(),
  company: z.string().nullable(),
  title: z.string().nullable(),
  score: z.number().min(0).max(5).nullable(),
  pdf: z.boolean().nullable(),
  note: z.string().nullable(),
});
export type PipelineEntry = z.infer<typeof PipelineEntrySchema>;

/** PipelineEntry enriched with cross-source data (joined at page level). */
export interface EnrichedPipelineEntry extends PipelineEntry {
  evalDate: string | null;   // applications.md date
  appNotes: string | null;   // applications.md notes (1-line decision rationale)
  firstSeen: string | null;  // scan-history.tsv first_seen
}

// ── Report (reports/NNN-slug-YYYY-MM-DD.md) ─────────────────────
// File-name yields num + slug + date. Body has "**Key:** value" header
// then "## Blocks" table (A-F rows) then narrative sections.
/** One parsed report file from reports/ directory */
export const ReportSchema = z.object({
  num: z.number().int().positive(),
  slug: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(1),
  score: z.number().min(0).max(5),
  url: z.string().url().nullable(),
  pdf: z.boolean(),
  legitimacy: z.string().nullable(),
  blocks: z.object({
    A: z.object({ score: z.number().min(0).max(5), notes: z.string() }).nullable(),
    B: z.object({ score: z.number().min(0).max(5), notes: z.string() }).nullable(),
    C: z.object({ score: z.number().min(0).max(5), notes: z.string() }).nullable(),
    D: z.object({ score: z.number().min(0).max(5), notes: z.string() }).nullable(),
    E: z.object({ score: z.number().min(0).max(5), notes: z.string() }).nullable(),
    F: z.object({ score: z.number().min(0).max(5), notes: z.string() }).nullable(),
  }),
  body: z.string(),
});
export type Report = z.infer<typeof ReportSchema>;

// ── Listing (report MD + companion PDF path) ────────────────────
/** A report paired with its optional companion PDF path */
export const ListingSchema = z.object({
  report: ReportSchema,
  pdfPath: z.string().nullable(),
});
export type Listing = z.infer<typeof ListingSchema>;

// ── ParseError (used by all parsers for per-row error boundary) ─
/** Per-row error emitted by parsers when a row fails validation */
export interface ParseError {
  row: number;
  raw: string;
  reason: string;
}
