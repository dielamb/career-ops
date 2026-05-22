// POST /api/profile/cv-pdf
// Upload CV PDF → Claude extracts text (handles multi-column layouts) → store in profiles.cv_text
// Returns: { cvText, charCount }

import Anthropic from '@anthropic-ai/sdk';
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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return jsonError(500, 'ANTHROPIC_API_KEY not configured');

  // Get user's own API key if set (falls back to server key)
  const { data: profile } = await supabase
    .from('profiles')
    .select('anthropic_api_key_encrypted')
    .eq('user_id', user.id)
    .single();
  const effectiveKey = profile?.anthropic_api_key_encrypted ?? apiKey;

  // Extract text: try Claude first (handles multi-column), fall back to pdf-parse
  let cvText: string;
  let extractionMethod = 'claude';

  try {
    const anthropic = new Anthropic({ apiKey: effectiveKey });
    const pdfBase64 = buffer.toString('base64');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docBlock: any = {
      type: 'document',
      source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
    };

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          docBlock,
          {
            type: 'text',
            text: `Extract the full CV/resume text from this PDF.
Output plain text only — no JSON, no markdown headers, no commentary.
Preserve: name, contact info, all work experience (company, title, dates, bullet points), education, skills sections.
Handle multi-column layout correctly — read left column first, then right column.
Do NOT add any text that isn't in the original PDF.`,
          },
        ],
      }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected Claude response type');
    cvText = content.text.trim();
  } catch {
    // Claude unavailable (no credits, rate limit, etc.) — fall back to pdf-parse
    extractionMethod = 'pdf-parse';
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;
      const result = await pdfParse(buffer);
      cvText = result.text.trim();
    } catch (fallbackErr) {
      const msg = fallbackErr instanceof Error ? fallbackErr.message : 'Unknown error';
      return jsonError(500, `CV extraction failed: ${msg}`);
    }
  }

  if (!cvText) {
    return jsonError(422, 'No text extracted from PDF');
  }

  // Save to profiles
  const { error: upsertErr } = await supabase
    .from('profiles')
    .upsert({ user_id: user.id, cv_text: cvText });

  if (upsertErr) return jsonError(500, upsertErr.message);

  return Response.json({
    cvText,
    charCount: cvText.length,
    extractionMethod,
    message: extractionMethod === 'claude'
      ? `CV extracted with Claude (${cvText.length} chars). Review and save.`
      : `CV extracted with pdf-parse (${cvText.length} chars). Layout may be imperfect — review and save.`,
  }, { status: 200 });
}
