interface CacheItem<T> {
  data: T
  timestamp: number
  expires: number
}

class SmartCache {
  private cache = new Map<string, CacheItem<any>>()
  private maxSize = 100 // Maximum cache entries

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Clean old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expires: Date.now() + ttl
    })

    // Auto cleanup expired items
    this.scheduleCleanup(key, ttl)
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  private cleanup(): void {
    const now = Date.now()
    const toDelete: string[] = []

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        toDelete.push(key)
      }
    }

    // Delete oldest entries if still too many
    if (toDelete.length === 0 && this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      toDelete.push(...entries.slice(0, 10).map(([key]) => key))
    }

    toDelete.forEach(key => this.cache.delete(key))
  }

  private scheduleCleanup(key: string, ttl: number): void {
    setTimeout(() => {
      this.cache.delete(key)
    }, ttl + 1000)
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    }
  }
}

export const cache = new SmartCache()

// Enhanced API helper with intelligent caching
export async function cachedFetch<T>(
  url: string, 
  options?: RequestInit,
  ttl: number = 5 * 60 * 1000,
  cacheKey?: string
): Promise<T> {
  const key = cacheKey || `${url}-${JSON.stringify(options?.body || {})}`
  
  // Try cache first
  const cached = cache.get<T>(key)
  if (cached) {
    return cached
  }

  // Fetch from API
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    }
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error(`API Error for ${url}:`, {
      status: response.status,
      statusText: response.statusText,
      responseText: errorText
    })
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  // Enhanced JSON parsing with error handling
  let data: T
  const responseText = await response.text()
  
  try {
    console.log(`Response from ${url}:`, responseText.substring(0, 200) + '...')
    data = JSON.parse(responseText)
  } catch (parseError) {
    console.error(`JSON Parse Error for ${url}:`, {
      parseError,
      responseText: responseText.substring(0, 500),
      responseHeaders: Object.fromEntries(response.headers.entries())
    })
    throw new Error(`JSON Parse Error: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`)
  }
  
  // Cache the result
  cache.set(key, data, ttl)
  
  return data
}

// Specialized cache for different data types
export const cacheKeys = {
  properties: 'properties',
  transactions: 'transactions', 
  analytics: 'analytics',
  agents: 'agents',
  contacts: 'contacts'
} as const

export function invalidateCache(type: keyof typeof cacheKeys) {
  cache.invalidatePattern(cacheKeys[type])
  
  // Notify other tabs/windows about cache invalidation
  if (typeof window !== 'undefined') {
    localStorage.setItem('cache-invalidated', type)
    localStorage.removeItem('cache-invalidated') // Clear immediately to trigger event
  }
}