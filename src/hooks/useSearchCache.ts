import { useState, useCallback, useRef } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface SearchCacheOptions {
  maxAge?: number // Cache time in milliseconds (default: 5 minutes)
  maxSize?: number // Maximum number of cached entries (default: 50)
}

export function useSearchCache<T>(options: SearchCacheOptions = {}) {
  const { maxAge = 5 * 60 * 1000, maxSize = 50 } = options // 5 minutes default
  
  const cacheRef = useRef(new Map<string, CacheEntry<T>>())
  const statsRef = useRef({ hits: 0, misses: 0 })

  const get = useCallback((key: string): T | null => {
    const now = Date.now()
    const entry = cacheRef.current.get(key)
    
    if (!entry) {
      statsRef.current.misses++
      return null
    }
    
    if (now > entry.expiresAt) {
      cacheRef.current.delete(key)
      statsRef.current.misses++
      return null
    }
    
    statsRef.current.hits++
    return entry.data
  }, [])

  const set = useCallback((key: string, data: T) => {
    const now = Date.now()
    
    // Remove expired entries and enforce size limit
    if (cacheRef.current.size >= maxSize) {
      // Remove oldest entries first
      const entries = Array.from(cacheRef.current.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      // Remove oldest 25% of entries or expired entries
      const toRemove = Math.max(1, Math.floor(maxSize * 0.25))
      for (let i = 0; i < toRemove && i < entries.length; i++) {
        cacheRef.current.delete(entries[i][0])
      }
    }
    
    // Remove expired entries
    for (const [k, entry] of cacheRef.current.entries()) {
      if (now > entry.expiresAt) {
        cacheRef.current.delete(k)
      }
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + maxAge
    }
    
    cacheRef.current.set(key, entry)
  }, [maxAge, maxSize])

  const clear = useCallback(() => {
    cacheRef.current.clear()
    statsRef.current = { hits: 0, misses: 0 }
  }, [])

  const remove = useCallback((key: string) => {
    cacheRef.current.delete(key)
  }, [])

  const has = useCallback((key: string): boolean => {
    const now = Date.now()
    const entry = cacheRef.current.get(key)
    return entry ? now <= entry.expiresAt : false
  }, [])

  const size = cacheRef.current.size
  const hitRate = statsRef.current.hits + statsRef.current.misses > 0 
    ? (statsRef.current.hits / (statsRef.current.hits + statsRef.current.misses) * 100).toFixed(1)
    : '0.0'

  return {
    get,
    set,
    has,
    clear,
    remove,
    size,
    stats: {
      hits: statsRef.current.hits,
      misses: statsRef.current.misses,
      hitRate: `${hitRate}%`
    }
  }
}