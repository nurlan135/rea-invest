interface CacheEntry {
  data: unknown
  expiry: number
}

class APIClient {
  private baseURL: string
  private cache: Map<string, CacheEntry> = new Map()

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || ''
  }

  private getCacheKey(url: string, options?: RequestInit): string {
    return `${url}-${JSON.stringify(options?.body || {})}`
  }

  private isExpired(expiry: number): boolean {
    return Date.now() > expiry
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, options)
    const cached = this.cache.get(cacheKey)

    if (cached && !this.isExpired(cached.expiry)) {
      return cached.data as T
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const data: T = await response.json()

    // Cache for 5 minutes
    this.cache.set(cacheKey, {
      data,
      expiry: Date.now() + 5 * 60 * 1000
    })

    return data
  }

  async post<T>(endpoint: string, body: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    // Clear cache on mutations
    this.clearCache()

    return response.json()
  }

  async put<T>(endpoint: string, body: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    this.clearCache()
    return response.json()
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    this.clearCache()
    return response.json()
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const apiClient = new APIClient()