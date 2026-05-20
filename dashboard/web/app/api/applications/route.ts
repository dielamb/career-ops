import { parseApplications } from '@/lib/parse-applications';
import { applicationsPath } from '@/lib/api-paths';
import { jsonOk } from '@/lib/api-helpers';

/** Force dynamic — file content can change between requests. */
export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await parseApplications(applicationsPath());
  return jsonOk(result);
}
