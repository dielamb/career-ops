import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // MUST use getUser() not getSession() — getSession() not server-validated
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith('/auth');
  const isWebhook = pathname.startsWith('/api/billing/webhook');
  const isApiRoute = pathname.startsWith('/api/');

  if (!user && !isAuthRoute && !isWebhook) {
    // API routes: return 401 JSON (not HTML redirect — clients expect JSON)
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    return NextResponse.redirect(url);
  }

  // Phase 0 safety: routes that still read from the local filesystem (the
  // admin's career-ops MD/PDF working dir) are gated to admin emails until
  // per-user data flow ships. Without this, every signed-in user sees the
  // admin's personal pipeline / reports / PDFs.
  //
  // NOTE: `/api/scan/run` is NOT on this list — it's the M1 per-user scan
  // that reads from Supabase (RLS-scoped) and a read-only repo-root config,
  // so any authenticated user can call it. The legacy `/api/actions/scan`
  // (admin-only spawn of scan.mjs against local FS) stays gated below.
  const FS_BACKED_PREFIXES = [
    '/reports',
    '/api/file',
    '/api/listing',
    '/api/pipeline/sync',
    '/api/scans',
    '/api/actions',
  ];
  const isFsBacked = FS_BACKED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (isFsBacked) {
    const adminEmails = (process.env.ADMIN_EMAILS ?? 'maciejkamichal@gmail.com')
      .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
    const isUserAdmin = !!user?.email && adminEmails.includes(user.email.toLowerCase());
    if (!isUserAdmin) {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Beta feature — coming soon' }, { status: 403 });
      }
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('beta', '1');
      return NextResponse.redirect(url);
    }
  }

  // MUST return supabaseResponse — not a new NextResponse
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
