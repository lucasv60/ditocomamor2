import { CacheEntry, CacheConfig } from './types'

// Simple in-memory cache with TTL support
class MemoryCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>()
  private config: CacheConfig

  constructor(config: CacheConfig = { ttl: 5 * 60 * 1000, maxSize: 100 }) {
    this.config = config
  }

  set(key: string, value: T): void {
    // Check if cache is at max size
    if (this.cache.size >= this.config.maxSize) {
      // Remove oldest entry (simple LRU approximation)
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    const entry: CacheEntry<T> = {
      data: value,
      expiry: Date.now() + this.config.ttl,
      createdAt: Date.now(),
    }

    this.cache.set(key, entry)
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    // Clean expired entries before returning size
    this.cleanup()
    return this.cache.size
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instances
export const pageCache = new MemoryCache({
  ttl: 10 * 60 * 1000, // 10 minutes for pages
  maxSize: 50,
})

export const apiCache = new MemoryCache({
  ttl: 5 * 60 * 1000, // 5 minutes for API responses
  maxSize: 100,
})

// Cache utilities
export function getCacheKey(...parts: (string | number)[]): string {
  return parts.join(':')
}

// Cache wrapper for functions
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  cache: MemoryCache,
  keyFn?: (...args: Parameters<T>) => string
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyFn ? keyFn(...args) : getCacheKey(fn.name, ...args)

    // Try to get from cache first
    const cached = cache.get(key)
    if (cached !== null) {
      return cached
    }

    // Execute function and cache result
    const result = await fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

// Cache invalidation helpers
export function invalidatePageCache(pageName?: string): void {
  if (pageName) {
    // Invalidate specific page
    pageCache.delete(`page:${pageName}`)
  } else {
    // Clear all page cache
    pageCache.clear()
  }
}

export function invalidateApiCache(endpoint?: string): void {
  if (endpoint) {
    // Invalidate specific API endpoint cache
    for (const key of apiCache['cache'].keys()) {
      if (key.startsWith(`api:${endpoint}`)) {
        apiCache.delete(key)
      }
    }
  } else {
    // Clear all API cache
    apiCache.clear()
  }
}