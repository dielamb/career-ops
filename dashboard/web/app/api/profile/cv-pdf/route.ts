// POST /api/profile/cv-pdf
// Upload CV PDF → extract text with pdf-parse → store in profiles.cv_text
// Returns: { cvText, charCount }

import { createServerSupabase } from '@/lib/supabase-server';
import { jsonError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return jsonError(401, 'Unauthorized');

  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.includes('multipart/form-data')) {
    return jsonError(400, 'Expected multipart/form-data');
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return jsonError(400, 'Failed to parse form data');
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return jsonError(400, 'No file uploaded');
  }

  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    return jsonError(400, 'Only PDF files accepted');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > MAX_PDF_BYTES) {
    return jsonError(400, 'PDF too large (max 5 MB)');
  }

  // Extract text using pdf-parse
  let cvText: string;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;
    const result = await pdfParse(buffer);
    cvText = result.text.trim();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return jsonError(500, `PDF extraction failed: ${msg}`);
  }

  if (!cvText) {
    return jsonError(422, 'PDF appears to be empty or image-only (no extractable text)');
  }

  // Save to profiles
  const { error: upsertErr } = await supabase
    .from('profiles')
    .upsert({ user_id: user.id, cv_text: cvText });

  if (upsertErr) return jsonError(500, upsertErr.message);

  return Response.json({
    cvText,
    charCount: cvText.length,
    message: `CV extracted (${cvText.length} chars). Saved to profile.`,
  }, { status: 200 });
}
