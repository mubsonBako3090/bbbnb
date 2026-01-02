const store = new Map();

/**
 * Simple in-memory rate limiter
 */
export function rateLimit(ip, limit = 5, windowMs = 60_000) {
  const now = Date.now();

  const timestamps = store.get(ip) || [];
  const recent = timestamps.filter(ts => now - ts < windowMs);

  if (recent.length >= limit) {
    return false;
  }

  store.set(ip, [...recent, now]);
  return true;
}
