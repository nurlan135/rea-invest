import { useState, useEffect, useCallback } from 'react'
import { cache, cachedFetch } from '@/lib/cache'

interface UseCacheOptions {
  ttl?: number
  key?: string
  enabled?: boolean
}

export function useCache<T>(
  url: string,
  options: UseCacheOptions = {}
) {
  const { ttl = 5 * 60 * 1000, key, enabled = true } = options
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) return

    try {
      setIsLoading(true)
      setError(null)
      const result = await cachedFetch<T>(url, undefined, ttl, key)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [url, ttl, key, enabled])

  const invalidate = useCallback(() => {
    const cacheKey = key || `${url}-{}`
    cache.clear(cacheKey)
    fetchData()
  }, [key, url, fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    invalidate
  }
}