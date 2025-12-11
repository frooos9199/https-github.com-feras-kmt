// Simple in-memory rate limiter
interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

export function rateLimit(identifier: string, limit: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const key = identifier

  if (!store[key] || store[key].resetTime < now) {
    // First request or window expired
    store[key] = {
      count: 1,
      resetTime: now + windowMs
    }
    return true
  }

  if (store[key].count >= limit) {
    // Rate limit exceeded
    return false
  }

  // Increment count
  store[key].count++
  return true
}

export function getRemainingTime(identifier: string): number {
  const entry = store[identifier]
  if (!entry) return 0
  
  const remaining = Math.ceil((entry.resetTime - Date.now()) / 1000 / 60)
  return remaining > 0 ? remaining : 0
}
