// In-memory sliding-window rate limiter.
// NOTE: serverless instances each hold their own map, so this is best-effort.
// For strict global limits, swap to Upstash Redis (drop-in @upstash/ratelimit).

interface Entry {
  count: number
  resetAt: number
}

const buckets = new Map<string, Entry>()

// Periodic cleanup so the map doesn't grow unbounded.
let cleanupStarted = false
function startCleanup() {
  if (cleanupStarted) return
  cleanupStarted = true
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of buckets.entries()) {
      if (entry.resetAt < now) buckets.delete(key)
    }
  }, 5 * 60 * 1000).unref?.()
}

export interface RateLimitResult {
  ok: boolean
  remaining: number
  resetAt: number
  retryAfterSeconds: number
}

/**
 * Allow `max` calls per `windowMs` for `key`. Returns whether the call is allowed.
 * Counts the current call against the budget when allowed.
 */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number,
): RateLimitResult {
  startCleanup()

  const now = Date.now()
  const entry = buckets.get(key)

  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs
    buckets.set(key, { count: 1, resetAt })
    return { ok: true, remaining: max - 1, resetAt, retryAfterSeconds: 0 }
  }

  if (entry.count >= max) {
    return {
      ok: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    }
  }

  entry.count++
  return {
    ok: true,
    remaining: max - entry.count,
    resetAt: entry.resetAt,
    retryAfterSeconds: 0,
  }
}

export const GENERATION_LIMITS = {
  // 30 generations per minute per user — well below any human pace,
  // catches loops and abuse without affecting normal use.
  perMinute: { max: 30, windowMs: 60 * 1000 },
  // 200 generations per hour per user — second line of defense
  // against slow-burn abuse that flies under the per-minute window.
  perHour: { max: 200, windowMs: 60 * 60 * 1000 },
}

/**
 * Apply the standard generation rate limits for a user.
 * Returns null if allowed, or a Response object to return immediately.
 */
export function checkGenerationLimit(userId: string): {
  ok: true
} | {
  ok: false
  status: 429
  body: { error: string; retryAfter: number }
  headers: Record<string, string>
} {
  const minute = rateLimit(
    `gen:min:${userId}`,
    GENERATION_LIMITS.perMinute.max,
    GENERATION_LIMITS.perMinute.windowMs,
  )
  if (!minute.ok) {
    return {
      ok: false,
      status: 429,
      body: {
        error: `Too many generations. Try again in ${minute.retryAfterSeconds}s.`,
        retryAfter: minute.retryAfterSeconds,
      },
      headers: {
        'Retry-After': String(minute.retryAfterSeconds),
        'X-RateLimit-Limit': String(GENERATION_LIMITS.perMinute.max),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(minute.resetAt / 1000)),
      },
    }
  }

  const hour = rateLimit(
    `gen:hour:${userId}`,
    GENERATION_LIMITS.perHour.max,
    GENERATION_LIMITS.perHour.windowMs,
  )
  if (!hour.ok) {
    return {
      ok: false,
      status: 429,
      body: {
        error: `Hourly generation limit reached. Try again in ${Math.ceil(hour.retryAfterSeconds / 60)} minutes.`,
        retryAfter: hour.retryAfterSeconds,
      },
      headers: {
        'Retry-After': String(hour.retryAfterSeconds),
        'X-RateLimit-Limit': String(GENERATION_LIMITS.perHour.max),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(hour.resetAt / 1000)),
      },
    }
  }

  return { ok: true }
}
