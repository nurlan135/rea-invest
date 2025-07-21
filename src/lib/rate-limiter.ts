interface RateLimitEntry {
  count: number
  resetTime: number
  blocked: boolean
  blockUntil?: number
}

class RateLimiter {
  private attempts = new Map<string, RateLimitEntry>()
  private maxAttempts: number
  private windowMs: number
  private blockDurationMs: number

  constructor(
    maxAttempts = 5,
    windowMs = 15 * 60 * 1000, // 15 minutes
    blockDurationMs = 30 * 60 * 1000 // 30 minutes block
  ) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
    this.blockDurationMs = blockDurationMs

    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  private getKey(ip: string, identifier?: string): string {
    return identifier ? `${ip}:${identifier}` : ip
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.attempts.entries()) {
      // Remove if reset time passed and not blocked, or if block period ended
      if ((now > entry.resetTime && !entry.blocked) || 
          (entry.blocked && entry.blockUntil && now > entry.blockUntil)) {
        this.attempts.delete(key)
      }
    }
  }

  checkLimit(ip: string, identifier?: string): {
    allowed: boolean
    remaining: number
    resetTime: number
    blocked?: boolean
    blockUntil?: number
  } {
    const key = this.getKey(ip, identifier)
    const now = Date.now()
    
    let entry = this.attempts.get(key)

    // Check if currently blocked
    if (entry?.blocked && entry.blockUntil && now < entry.blockUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        blocked: true,
        blockUntil: entry.blockUntil
      }
    }

    // Reset if window expired
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + this.windowMs,
        blocked: false
      }
      this.attempts.set(key, entry)
    }

    // Clear block if block period expired
    if (entry.blocked && entry.blockUntil && now >= entry.blockUntil) {
      entry.blocked = false
      entry.blockUntil = undefined
      entry.count = 0
      entry.resetTime = now + this.windowMs
    }

    const remaining = Math.max(0, this.maxAttempts - entry.count)
    
    return {
      allowed: entry.count < this.maxAttempts,
      remaining,
      resetTime: entry.resetTime,
      blocked: entry.blocked,
      blockUntil: entry.blockUntil
    }
  }

  recordAttempt(ip: string, identifier?: string, success: boolean = false): {
    allowed: boolean
    remaining: number
    resetTime: number
    blocked?: boolean
    blockUntil?: number
    rateLimited?: boolean
  } {
    const key = this.getKey(ip, identifier)
    const limit = this.checkLimit(ip, identifier)
    
    if (!limit.allowed) {
      return { ...limit, rateLimited: true }
    }

    const entry = this.attempts.get(key)!
    
    if (success) {
      // Reset on successful login
      this.attempts.delete(key)
      return {
        allowed: true,
        remaining: this.maxAttempts,
        resetTime: Date.now() + this.windowMs
      }
    } else {
      // Record failed attempt
      entry.count += 1
      
      // Block if max attempts reached
      if (entry.count >= this.maxAttempts) {
        entry.blocked = true
        entry.blockUntil = Date.now() + this.blockDurationMs
      }
      
      this.attempts.set(key, entry)
      
      const remaining = Math.max(0, this.maxAttempts - entry.count)
      
      return {
        allowed: remaining > 0,
        remaining,
        resetTime: entry.resetTime,
        blocked: entry.blocked,
        blockUntil: entry.blockUntil,
        rateLimited: entry.blocked
      }
    }
  }

  getStatus(ip: string, identifier?: string) {
    return this.checkLimit(ip, identifier)
  }

  // For debugging/admin purposes
  getStats() {
    const now = Date.now()
    const active = Array.from(this.attempts.entries())
      .filter(([_, entry]) => now < entry.resetTime || (entry.blocked && entry.blockUntil && now < entry.blockUntil))
      .map(([key, entry]) => ({
        key,
        count: entry.count,
        blocked: entry.blocked,
        resetIn: Math.max(0, entry.resetTime - now),
        blockUntil: entry.blockUntil ? Math.max(0, entry.blockUntil - now) : undefined
      }))

    return {
      totalActive: active.length,
      blocked: active.filter(a => a.blocked).length,
      entries: active
    }
  }
}

// Singleton instance for login attempts
export const loginRateLimiter = new RateLimiter(
  5,               // max 5 attempts
  15 * 60 * 1000, // in 15 minutes
  30 * 60 * 1000  // block for 30 minutes
)

// General API rate limiter (more permissive)
export const apiRateLimiter = new RateLimiter(
  60,              // max 60 requests
  1 * 60 * 1000,  // per minute
  5 * 60 * 1000   // block for 5 minutes
)