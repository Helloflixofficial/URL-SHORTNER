import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'

// Allowlist of permitted option keys — prevents arbitrary key injection
const ALLOWED_KEYS = new Set([
  'site_name', 'site_description', 'site_email', 'earning_mode',
  'enable_publisher_earnings', 'member_default_advert', 'anonymous_default_advert',
  'min_withdrawal', 'alias_min_length', 'alias_max_length',
  'maintenance_mode', 'disallowed_domains', 'referral_percentage',
  'interstitial_ad_url', 'interstitial_banner_ad',
  'banner_728x90', 'banner_468x60', 'banner_336x280',
  'enable_popup', 'popup_ad_url',
  'withdraw_processing_time',
  'withdraw_method_paypal', 'withdraw_method_bitcoin', 'withdraw_method_bank_transfer',
  'withdraw_method_payeer', 'withdraw_method_skrill',
  'payout_rates_interstitial', 'payout_rates_banner', 'payout_rates_popup',
  'enable_captcha', 'recaptcha_site_key', 'recaptcha_secret_key',
  'mail_driver', 'smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'smtp_encryption',
  'google_client_id', 'google_client_secret',
  'facebook_app_id', 'facebook_app_secret',
  'footer_text', 'custom_css', 'custom_js_header', 'blog_custom_theme',
  'ads_blog_interstitial_enabled', 'ads_blog_interstitial_timer', 'ads_blog_interstitial_steps',
])



export async function POST(req: NextRequest) {
  if (!(await requireAdminSession()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, string>
  try {
    body = await req.json() as Record<string, string>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Filter to only allowed keys and enforce max value length (64KB)
  const filtered = Object.entries(body).filter(
    ([key, value]) => ALLOWED_KEYS.has(key) && typeof value === 'string' && value.length <= 65536
  )

  if (filtered.length === 0) {
    return NextResponse.json({ ok: true })
  }

  // Upsert all provided allowed keys
  await Promise.all(
    filtered.map(([key, value]) =>
      prisma.option.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  )

  return NextResponse.json({ ok: true })
}

export async function GET() {
  if (!(await requireAdminSession()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const options = await prisma.option.findMany({
    where: { key: { in: [...ALLOWED_KEYS] } },
  })
  const result: Record<string, string> = {}
  options.forEach(o => { result[o.key] = o.value })
  return NextResponse.json(result)
}
