// POST /api/intake
// Job URL intake: detect ATS → fetch JD → score with Claude → store in Supabase
// Returns: { pipelineId, score, title, company, summary } | { error }

import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { createServerSupabase } from '@/lib/supabase-server';
import { fetchJobDescription, AtsFetchError } from '@/lib/ats-fetch';
import { validateUrl, InvalidUrlError } from '@/lib/spawn-mjs';
import { jsonError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

const IntakeBody = z.object({
  url: z.string().min(1),
  jdText: z.string().optional(), // manual paste fallback when ATS fetch fails
});

// Structured scoring prompt — returns JSON, not Markdown blocks
const SCORE_SYSTEM = `You are a senior career advisor evaluating job-candidate fit.
Given a job description and candidate CV, return ONLY a valid JSON object (no markdown, no explanation).
Score each dimension A-F on a scale of 1.0-5.0 (0.5 increments).
Overall score = average of A-F rounded to 2 decimal places.`;

function buildScorePrompt(jdText: string, cvText: string): string {
  return `JOB DESCRIPTION:
${jdText}

---

CANDIDATE CV:
${cvText}

---

Evaluate fit and return ONLY this JSON (no other text):
{
  "title": "<job title from JD>",
  "company": "<company name from JD>",
  "score": <overall 1.0-5.0>,
  "dimensions": {
    "A": <role_fit 1.0-5.0>,
    "B": <cv_match 1.0-5.0>,
    "C": <level_fit 1.0-5.0>,
    "D": <comp_market 1.0-5.0>,
    "E": <effort_to_apply 1.0-5.0>,
    "F": <interview_odds 1.0-5.0>
  },
  "summary": "<3-sentence match summary>",
  "key_gaps": ["<gap1>", "<gap2>"],
  "recommendation": "apply" | "skip" | "evaluate"
}`;
}

export async function POST(req: Request) {
  // 1. Parse body
  let raw: unknown;
  try { raw = await req.json(); } catch {
    return jsonError(400, 'Invalid JSON body');
  }
  const parsed = IntakeBody.safeParse(raw);
  if (!parsed.success) return jsonError(400, 'Missing url field');
  const { url, jdText: manualJd } = parsed.data;

  // 2. Validate URL
  try { validateUrl(url); } catch (err) {
    if (err instanceof InvalidUrlError) return jsonError(400, err.message);
    throw err;
  }

  // 3. Get authenticated user + their profile
  const supabase = await createServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return jsonError(401, 'Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('cv_text')
    .eq('user_id', user.id)
    .single();

  const cvText = profile?.cv_text?.trim() ?? '';
  if (!cvText) return jsonError(400, 'No CV found. Add your CV in Settings first.');

  // 4. Check usage limit (free tier: 10 evals/month)
  const { data: usage } = await supabase
    .from('usage_counters')
    .select('eval_count, month_start')
    .eq('user_id', user.id)
    .single();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const currentCount = usage?.month_start === monthStart ? (usage.eval_count ?? 0) : 0;

  if (currentCount >= 10) {
    return jsonError(429, 'Free tier limit reached (10 evaluations/month). Upgrade to Pro.');
  }

  // 5. Fetch JD from ATS (or use manual paste)
  let jd: Awaited<ReturnType<typeof fetchJobDescription>> | null = null;
  let jdFetchError: string | null = null;

  if (!manualJd) {
    try {
      jd = await fetchJobDescription(url);
    } catch (err) {
      if (err instanceof AtsFetchError) {
        jdFetchError = err.message;
      } else throw err;
    }
  }

  const jdText = manualJd ?? jd?.jdText ?? null;
  if (!jdText) {
    return jsonError(422, jdFetchError ?? 'Could not fetch job description. Paste the text manually.');
  }

  // 6. Score with Claude API
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return jsonError(500, 'ANTHROPIC_API_KEY not configured on server');

  const anthropic = new Anthropic({ apiKey });

  let scoreResult: {
    title: string;
    company: string;
    score: number;
    dimensions: Record<string, number>;
    summary: string;
    key_gaps: string[];
    recommendation: string;
  };

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      system: SCORE_SYSTEM,
      messages: [{ role: 'user', content: buildScorePrompt(jdText, cvText) }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    // Strip markdown code fences if model wraps output
    const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    scoreResult = JSON.parse(clean);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return jsonError(500, `Claude scoring failed: ${msg}`);
  }

  // 7. Save listing + pipeline to Supabase
  const { data: listing, error: listingErr } = await supabase
    .from('listings')
    .insert({
      user_id: user.id,
      url,
      jd_text: jdText,
      company: jd?.company ?? scoreResult.company,
      title: jd?.title ?? scoreResult.title,
      source: jd?.ats ?? 'manual',
    })
    .select('id')
    .single();

  if (listingErr) return jsonError(500, `Failed to save listing: ${listingErr.message}`);

  const { data: pipelineRow, error: pipeErr } = await supabase
    .from('pipeline')
    .insert({
      user_id: user.id,
      listing_id: listing.id,
      url,
      company: jd?.company ?? scoreResult.company,
      title: jd?.title ?? scoreResult.title,
      score: scoreResult.score,
      dimension_scores: scoreResult.dimensions,
      gap_analysis: scoreResult.key_gaps.join('; '),
      notes: scoreResult.summary,
      status: 'evaluated',
      eval_date: now.toISOString().slice(0, 10),
    })
    .select('id')
    .single();

  if (pipeErr) return jsonError(500, `Failed to save pipeline entry: ${pipeErr.message}`);

  // 8. Increment usage counter
  await supabase
    .from('usage_counters')
    .upsert({
      user_id: user.id,
      month_start: monthStart,
      eval_count: currentCount + 1,
    });

  return Response.json({
    pipelineId: pipelineRow.id,
    listingId: listing.id,
    score: scoreResult.score,
    title: jd?.title ?? scoreResult.title,
    company: jd?.company ?? scoreResult.company,
    summary: scoreResult.summary,
    recommendation: scoreResult.recommendation,
    dimensions: scoreResult.dimensions,
    evalsRemaining: 10 - (currentCount + 1),
  }, { status: 201 });
}
