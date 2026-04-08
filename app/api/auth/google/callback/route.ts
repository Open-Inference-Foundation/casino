import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_FLOWSTACK_BASE_URL ?? 'https://sage-api.flowstack.fun';

/**
 * Google OAuth callback.
 * Google redirects here with ?code=...&state=...
 * Exchanges the code with the Flowstack backend, then redirects to /auth/complete
 * with the session token so the client can store credentials.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/login?auth_error=${error}`, req.nextUrl.origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?auth_error=missing_code', req.nextUrl.origin));
  }

  try {
    const res = await fetch(`${BACKEND_URL}/auth/google/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        redirect_uri: `${req.nextUrl.origin}/api/auth/google/callback`,
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('[GOOGLE-CALLBACK] Backend error:', await res.text());
      return NextResponse.redirect(new URL('/login?auth_error=backend_error', req.nextUrl.origin));
    }

    const data = await res.json();
    const params = new URLSearchParams({
      token: data.session_token,
      user_id: data.user_id,
      ...(data.tenant_id ? { tenant_id: data.tenant_id } : {}),
      ...(data.expires_at ? { expires_at: data.expires_at } : {}),
      ...(data.email ? { email: data.email } : {}),
    });
    return NextResponse.redirect(new URL(`/complete?${params}`, req.nextUrl.origin));
  } catch (err) {
    console.error('[GOOGLE-CALLBACK]', err);
    return NextResponse.redirect(new URL('/login?auth_error=connection_error', req.nextUrl.origin));
  }
}
