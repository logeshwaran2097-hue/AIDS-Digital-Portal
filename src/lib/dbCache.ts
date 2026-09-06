/**
 * Ultra-High-Speed In-Memory Database Query Cache
 * 
 * Provides sub-millisecond (< 1ms) data access for read-heavy operations,
 * avoiding slow multi-region DB network roundtrips, with instant invalidation
 * on mutations (create, update, delete) for real-time data consistency.
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
  tags: string[]
}

interface CacheStore {
  entries: Map<string, CacheEntry<any>>
}

const globalForCache = globalThis as unknown as {
  __dbCacheStore?: CacheStore
}

if (!globalForCache.__dbCacheStore) {
  globalForCache.__dbCacheStore = {
    entries: new Map(),
  }
}

const store = globalForCache.__dbCacheStore

/**
 * Wraps a database query with high-speed in-memory caching.
 * @param key Unique key for this query
 * @param queryFn The async database query function
 * @param ttlMs Time-to-live in milliseconds (default 5000ms = 5s)
 * @param tags Tags for bulk/targeted invalidation (e.g. ['announcements', 'attendance'])
 */
export async function cachedDbQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttlMs = 5000,
  tags: string[] = []
): Promise<T> {
  const now = Date.now()
  const cached = store.entries.get(key)

  // Return cached result immediately if valid
  if (cached && cached.expiresAt > now) {
    return cached.data as T
  }

  // Execute database query
  const data = await queryFn()

  // Store in fast memory cache
  store.entries.set(key, {
    data,
    expiresAt: now + ttlMs,
    tags,
  })

  return data
}

/**
 * Invalidate cache entries by tag or key prefix immediately upon mutation.
 * Guarantees that any change is reflected instantly across subsequent reads.
 */
export function invalidateCache(tagOrKeyPattern: string): number {
  const now = Date.now()
  let invalidatedCount = 0
  const lowerPattern = tagOrKeyPattern.toLowerCase()
  const keysToDelete: string[] = []

  store.entries.forEach((entry, key) => {
    const matchesTag = entry.tags.some((t: string) => t.toLowerCase() === lowerPattern)
    const matchesKey = key.toLowerCase().includes(lowerPattern)

    if (matchesTag || matchesKey || entry.expiresAt <= now) {
      keysToDelete.push(key)
    }
  })

  keysToDelete.forEach((key) => {
    store.entries.delete(key)
    invalidatedCount++
  })

  return invalidatedCount
}

/**
 * Clears the entire database cache
 */
export function clearAllDbCache(): void {
  store.entries.clear()
}

/**
 * Get cache diagnostics for debugging and performance telemetry
 */
export function getDbCacheStats() {
  const now = Date.now()
  let active = 0
  let expired = 0

  store.entries.forEach((entry) => {
    if (entry.expiresAt > now) active++
    else expired++
  })

  return {
    totalEntries: store.entries.size,
    active,
    expired,
  }
}
