import { prisma } from '@/lib/prisma'

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * Generate a random alias of the given length.
 */
function generateRandom(length: number): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return result
}

/**
 * Generate a unique short alias that doesn't yet exist in the DB.
 * Default length range: 5–7 chars.
 */
export async function generateUniqueAlias(minLen = 5, maxLen = 7): Promise<string> {
  let alias: string
  let exists = true

  do {
    const length = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen
    alias = generateRandom(length)
    const existing = await prisma.link.findUnique({ where: { alias } })
    exists = !!existing
  } while (exists)

  return alias
}

/**
 * Validate an alias string — alphanumeric, dash, underscore only; max 30 chars.
 */
export function isValidAlias(alias: string): boolean {
  return /^[0-9a-zA-Z_-]{1,30}$/.test(alias)
}

/**
 * Reserved route segments that cannot be used as aliases.
 */
export const RESERVED_ALIASES = [
  'admin', 'api', 'login', 'register', 'dashboard', 'member',
  'pricing', 'blog', 'contact', 'about', 'p', 'go', 'popad',
  'sitemap', 'robots', 'favicon', '_next', 'static',
]

export function isReservedAlias(alias: string): boolean {
  return RESERVED_ALIASES.includes(alias.toLowerCase())
}
