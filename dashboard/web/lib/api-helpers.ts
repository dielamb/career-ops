import { NextResponse } from 'next/server';

/** Build a 200 OK JSON response. */
export function jsonOk<T>(body: T, init?: { status?: number }): NextResponse {
  return NextResponse.json(body as object, { status: init?.status ?? 200 });
}

/** Build an error JSON response with shape { error, details? }. */
export function jsonError(
  status: number,
  error: string,
  details?: unknown,
): NextResponse {
  const body: { error: string; details?: unknown } = { error };
  if (details !== undefined) body.details = details;
  return NextResponse.json(body, { status });
}
