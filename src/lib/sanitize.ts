/**
 * Input sanitization utilities for production safety.
 * Strips HTML tags, trims whitespace, and limits length.
 */

/** Remove HTML tags and script injections from a string */
export function sanitizeText(input: string, maxLength = 1000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')           // Strip HTML tags
    .replace(/javascript:/gi, '')       // Block javascript: URIs
    .replace(/on\w+\s*=/gi, '')        // Block inline event handlers
    .trim()
    .slice(0, maxLength);
}

/** Sanitize an email address */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase().slice(0, 254);
}

/** Sanitize a numeric string, returning NaN for invalid values */
export function sanitizeNumber(input: string | number): number {
  const num = typeof input === 'number' ? input : parseFloat(String(input));
  if (isNaN(num) || !isFinite(num)) return NaN;
  return num;
}

/** Sanitize a MongoDB ObjectId string */
export function sanitizeId(id: string): string | null {
  if (typeof id !== 'string') return null;
  const cleaned = id.trim();
  // Valid MongoDB ObjectId is exactly 24 hex characters
  if (/^[a-f0-9]{24}$/i.test(cleaned)) return cleaned;
  // Also allow the mock IDs used during development (alphanumeric + underscore)
  if (/^[a-zA-Z0-9_-]+$/.test(cleaned) && cleaned.length <= 64) return cleaned;
  return null;
}
