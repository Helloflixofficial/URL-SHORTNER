import { prisma } from '@/lib/prisma'

/**
 * Simple in-memory cache for site options.
 * TTL: 60 seconds — settings rarely change, but every link redirect
 * calls getOption() multiple times, so caching saves hundreds of DB
 * reads per second on a busy site.
 */
const optionsCache = new Map<string, { value: string; expiresAt: number }>()
const CACHE_TTL_MS = 60_000 // 60 seconds

/**
 * Get a site option by key with a fallback default value.
 * Results are cached in-memory for 60 seconds.
 */
export async function getOption(key: string, defaultValue: string = ''): Promise<string> {
  const cached = optionsCache.get(key)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.value
  }

  const option = await prisma.option.findUnique({ where: { key } })
  const value = option?.value ?? defaultValue

  optionsCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS })
  return value
}

/**
 * Set a site option key/value pair (upsert).
 * Also invalidates the cache for this key.
 */
export async function setOption(key: string, value: string): Promise<void> {
  await prisma.option.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
  // Invalidate the cached value so the next read gets the fresh value
  optionsCache.delete(key)
}

/**
 * Get multiple options at once as a Record<key, value>.
 * Uses the cache where possible, fetches missing keys in a single query.
 */
export async function getOptions(keys: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  const uncachedKeys: string[] = []
  const now = Date.now()

  for (const key of keys) {
    const cached = optionsCache.get(key)
    if (cached && now < cached.expiresAt) {
      result[key] = cached.value
    } else {
      uncachedKeys.push(key)
    }
  }

  if (uncachedKeys.length > 0) {
    const options = await prisma.option.findMany({ where: { key: { in: uncachedKeys } } })
    for (const key of uncachedKeys) {
      const value = options.find((o) => o.key === key)?.value ?? ''
      result[key] = value
      optionsCache.set(key, { value, expiresAt: now + CACHE_TTL_MS })
    }
  }

  return result
}

/**
 * Typed helper — parses JSON option values.
 */
export async function getJsonOption<T>(key: string, defaultValue: T): Promise<T> {
  const raw = await getOption(key, '')
  if (!raw) return defaultValue
  try {
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

/**
 * Clear the entire options cache. Call this after bulk settings updates.
 */
export function invalidateOptionsCache() {
  optionsCache.clear()
}
