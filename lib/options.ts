import { prisma } from '@/lib/prisma'

/**
 * Get a site option by key with a fallback default value.
 */
export async function getOption(key: string, defaultValue: string = ''): Promise<string> {
  const option = await prisma.option.findUnique({ where: { key } })
  return option?.value ?? defaultValue
}

/**
 * Set a site option key/value pair (upsert).
 */
export async function setOption(key: string, value: string): Promise<void> {
  await prisma.option.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
}

/**
 * Get multiple options at once as a Record<key, value>.
 */
export async function getOptions(keys: string[]): Promise<Record<string, string>> {
  const options = await prisma.option.findMany({ where: { key: { in: keys } } })
  const result: Record<string, string> = {}
  for (const key of keys) {
    result[key] = options.find((o) => o.key === key)?.value ?? ''
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
