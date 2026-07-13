/**
 * Lightweight IP-to-country resolution.
 *
 * On Vercel, the platform injects an `x-vercel-ip-country` header containing
 * the ISO 3166-1 alpha-2 country code — no binary GeoIP DB needed.
 * Locally (or on other hosts) we fall back to geoip-lite if available,
 * otherwise return "Others".
 */
export function getCountryFromIp(ip: string, headers?: Headers): string {
  // 1. Prefer Vercel's injected country header (free, accurate, no binary DB)
  if (headers) {
    const vercelCountry = headers.get('x-vercel-ip-country')
    if (vercelCountry) return vercelCountry
  }

  // 2. Local dev fallback: try geoip-lite (may not be available in all envs)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const geoip = require('geoip-lite') as {
      lookup: (ip: string) => { country: string } | null
    }
    const geo = geoip.lookup(ip)
    return geo?.country ?? 'Others'
  } catch {
    return 'Others'
  }
}

/**
 * Extract the real client IP from Next.js request headers.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

/**
 * Simple heuristic: detect mobile vs desktop from User-Agent.
 * Returns 3 = mobile/tablet, 2 = desktop.
 */
export function getDeviceType(ua: string): 2 | 3 {
  const mobileRe =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i
  return mobileRe.test(ua) ? 3 : 2
}

/**
 * Common bot/crawler user-agent patterns.
 */
const BOT_RE =
  /Googlebot|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|Exabot|facebot|facebookexternalhit|ia_archiver|Twitterbot|LinkedInBot|WhatsApp|Discordbot|TelegramBot|Applebot|AhrefsBot|SemrushBot|MJ12bot|DotBot|Rogerbot/i

export function isBot(ua: string): boolean {
  return BOT_RE.test(ua)
}
