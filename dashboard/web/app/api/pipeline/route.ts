import { parsePipeline } from '@/lib/parse-pipeline';
import { pipelinePath } from '@/lib/api-paths';
import { jsonOk } from '@/lib/api-helpers';

/** Force dynamic — file content can change between requests. */
export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await parsePipeline(pipelinePath());
  return jsonOk(result);
}
