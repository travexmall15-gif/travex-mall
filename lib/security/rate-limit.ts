// ═══════════════════════════════════════════════════════════
// SHOPNEKT — Rate limiting for sensitive API routes (Part 37)
// ═══════════════════════════════════════════════════════════
// HONEST LIMITATION: this is an in-memory sliding-window limiter. On
// Vercel's serverless platform, each function instance has its own
// memory, and instances are not guaranteed to be reused between
// requests — under real distributed load (many concurrent cold starts)
// this only rate-limits requests that happen to land on the SAME warm
// instance, not globally across the whole deployment. It still raises
// the bar meaningfully for casual/scripted abuse from a single source
// hitting a warm instance repeatedly, but it is NOT a substitute for a
// centralized limiter (e.g. Upstash Redis + @upstash/ratelimit, or
// Vercel's Firewall/WAF rate-limiting rules) for true production-grade
// protection. Flagged here rather than presented as a complete fix.

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

// Periodic cleanup so the Map doesn't grow unbounded on a long-lived
// warm instance.
let lastSweep = Date.now()
function sweep() {
  const now = Date.now()
  if (now - lastSweep < 60_000) return
  lastSweep = now
  for (const [key, b] of buckets) {
    if (b.resetAt < now) buckets.delete(key)
  }
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

/**
 * Returns { allowed: true } if the request should proceed, or
 * { allowed: false, retryAfterSeconds } if the caller has exceeded
 * `limit` requests within `windowSeconds` for this key.
 */
export function rateLimit(key: string, limit: number, windowSeconds: number): { allowed: boolean; retryAfterSeconds?: number } {
  sweep()
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    return { allowed: true }
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) }
  }

  existing.count++
  return { allowed: true }
}
