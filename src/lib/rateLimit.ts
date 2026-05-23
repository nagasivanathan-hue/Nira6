/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window approach. Safe for single-instance Vercel deployments.
 * For multi-instance production, replace with Redis-backed rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60_000);

interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  maxRequests?: number;
  /** Window duration in milliseconds */
  windowMs?: number;
}

/**
 * Check if a request should be rate limited.
 * @returns `true` if the request is allowed, `false` if rate limited.
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number; resetIn: number } {
  const { maxRequests = 20, windowMs = 60_000 } = options;
  const now = Date.now();

  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  entry.count += 1;

  if (entry.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

/**
 * Extract a client identifier from a request for rate limiting.
 * Uses X-Forwarded-For (Vercel sets this), falling back to X-Real-IP.
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}
