import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of restricted API paths
const protectedApiPaths = ['/api/admin', '/api/orders', '/api/bookings', '/api/creators/onboarding'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Security Headers (Helmet-style)
  const response = NextResponse.next();
  
  // Prevent Clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // Strict Transport Security (HSTS)
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  // Content Security Policy (Basic)
  // response.headers.set('Content-Security-Policy', "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';");

  // 2. API Route Protection (Edge level)
  // If accessing a protected API route, ensure an Authorization header or specific cookie exists.
  // Note: For Next.js App Router with localStorage auth, page routes (/dashboard) are protected client-side.
  const isProtectedApi = protectedApiPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedApi) {
    const authHeader = request.headers.get('authorization');
    const tokenCookie = request.cookies.get('nira_token'); // For future-proofing if we move to cookies

    if (!authHeader && !tokenCookie) {
      return NextResponse.json({ message: 'Unauthorized Request - Edge Blocked' }, { status: 401 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
