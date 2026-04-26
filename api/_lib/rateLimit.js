// Minimal in-memory token-bucket per-IP rate limiter.
//
// Vercel serverless functions are short-lived per region/instance, so this
// only smooths localized bursts — not a global throttle. For real protection
// migrate to Upstash Redis. But it's enough to stop a single laptop from
// hammering /api/generate-tweet 200 times in a minute.
//
// Default budget: 30 calls / minute / IP.

import { clientIp } from './ip.js'

const DEFAULT_LIMIT = 30
const DEFAULT_WINDOW_MS = 60_000

const buckets = new Map() // key -> { count, resetAt }

/**
 * Returns true if the request is allowed. Mutates the bucket as a side effect.
 * Sets X-RateLimit-* response headers so the client can backoff.
 */
export function rateLimit(req, res, { limit = DEFAULT_LIMIT, windowMs = DEFAULT_WINDOW_MS, scope = 'global' } = {}) {
  const ip = clientIp(req)
  const key = `${scope}:${ip}`
  const now = Date.now()

  let bucket = buckets.get(key)
  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + windowMs }
    buckets.set(key, bucket)
  }

  bucket.count++
  const remaining = Math.max(0, limit - bucket.count)
  res.setHeader('X-RateLimit-Limit', String(limit))
  res.setHeader('X-RateLimit-Remaining', String(remaining))
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)))

  if (bucket.count > limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
    res.setHeader('Retry-After', String(retryAfter))
    res.status(429).json({
      error: 'rate_limited',
      message: `Too many requests — limit ${limit} per ${Math.round(windowMs / 1000)}s`,
      retryAfterSeconds: retryAfter,
    })
    return false
  }

  // Lazy GC — drop expired buckets occasionally so the map doesn't grow unbounded.
  if (Math.random() < 0.01) {
    for (const [k, b] of buckets.entries()) {
      if (b.resetAt < now) buckets.delete(k)
    }
  }
  return true
}
