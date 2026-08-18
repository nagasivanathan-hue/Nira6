/**
 * CSRF protection utility for NIRA6.
 * Validates request Origin or Referer header against the Host header for state-changing methods.
 */
export function verifyCsrf(req: Request): boolean {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return true;
  }

  const origin = req.headers.get('origin');
  const host = req.headers.get('host');

  // If no origin, fallback to check Referer
  if (!origin) {
    const referer = req.headers.get('referer');
    if (!referer) {
      // Allow non-browser requests (e.g. native apps/postman/backend tasks)
      return true;
    }
    try {
      const refererUrl = new URL(referer);
      return refererUrl.host === host;
    } catch {
      return false;
    }
  }

  try {
    const originUrl = new URL(origin);
    // Check if origin matches host
    if (originUrl.host !== host) {
      console.warn(`[CSRF Blocked] Origin (${originUrl.host}) does not match Host (${host})`);
      return false;
    }
  } catch {
    return false;
  }

  return true;
}
