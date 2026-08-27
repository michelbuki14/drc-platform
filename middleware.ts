import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/ratelimit';

// Config
const RATE_LIMIT = process.env.RATE_LIMIT_PER_MIN
  ? Number(process.env.RATE_LIMIT_PER_MIN)
  : 120;
const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const ALLOW_CREDENTIALS = process.env.CORS_ALLOW_CREDENTIALS === 'true';

/**
 * CSRF / cross-site protection for state-changing requests.
 * The session cookie is SameSite=Lax (blocks cross-site POST from other sites),
 * but we additionally reject cross-origin mutations that don't carry a matching
 * CSRF token header (X-CSRF-Token) to be defense-in-depth.
 */
const STATE_CHANGING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('Origin');
  if (!origin) return true; // same-origin or non-browser
  const host = req.headers.get('Host') || '';
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function setCors(response: NextResponse, origin: string | null) {
  let allowOrigin = '*';
  if (ALLOWED_ORIGINS.length === 1 && ALLOWED_ORIGINS[0] === '*') {
    allowOrigin = '*';
  } else if (origin && ALLOWED_ORIGINS.includes(origin)) {
    allowOrigin = origin;
  } else if (ALLOWED_ORIGINS.length > 0 && ALLOWED_ORIGINS[0] !== '*') {
    allowOrigin = ALLOWED_ORIGINS[0];
  }
  response.headers.set('Access-Control-Allow-Origin', allowOrigin);
  if (ALLOW_CREDENTIALS && allowOrigin !== '*') {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  return response;
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const origin = request.headers.get('Origin');

  // Preflight
  if (request.method === 'OPTIONS') {
    const preflight = new NextResponse(null, { status: 204 });
    setCors(preflight, origin);
    return preflight;
  }

  const response = NextResponse.next();
  setCors(response, origin);

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // CSRF: reject cross-site state-changing requests without a CSRF token header
  if (STATE_CHANGING.has(request.method) && !isSameOrigin(request)) {
    const csrf = request.headers.get('X-CSRF-Token');
    if (!csrf) {
      const denied = NextResponse.json(
        { error: 'Cross-site request blocked (missing CSRF token)' },
        { status: 403 }
      );
      setCors(denied, origin);
      return denied;
    }
  }

  // Rate limiting for API routes
  if (url.pathname.startsWith('/api/')) {
    const ip =
      request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ||
      request.headers.get('X-Real-IP') ||
      'unknown';
    const { success } = await rateLimit(ip, RATE_LIMIT);
    if (!success) {
      const rateLimited = NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      setCors(rateLimited, origin);
      return rateLimited;
    }
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
