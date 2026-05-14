import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calcEarnings } from '@/lib/earnings'
import { getClientIp } from '@/lib/geo'
import { getOption } from '@/lib/options'
import { z } from 'zod'

const goSchema = z.object({
  adFormData: z.string(),
  cookieData: z.string().optional(),
  hasAdblock: z.boolean().optional().default(false),
  captchaToken: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = goSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ status: 'error', message: 'Bad Request', url: '' }, { status: 400 })
    }

    const ip = getClientIp(req.headers)

    let adFormData: Record<string, unknown>
    try {
      adFormData = JSON.parse(Buffer.from(parsed.data.adFormData, 'base64').toString('utf-8'))
    } catch {
      return NextResponse.json({ status: 'error', message: 'Invalid data', url: '' }, { status: 400 })
    }

    // CAPTCHA Verification
    const enableCaptcha = await getOption('enable_captcha', 'no')
    if (enableCaptcha === 'yes') {
      const token = parsed.data.captchaToken
      if (!token) {
        return NextResponse.json({ status: 'error', message: 'Missing CAPTCHA', url: '' }, { status: 400 })
      }
      const captchaType = await getOption('captcha_type', 'recaptcha')
      const secret = await getOption(captchaType === 'recaptcha' ? 'recaptcha_secret_key' : 'hcaptcha_secret_key', '')
      
      let verifyUrl = 'https://www.google.com/recaptcha/api/siteverify'
      if (captchaType === 'hcaptcha') verifyUrl = 'https://hcaptcha.com/siteverify'
      
      const verifyRes = await fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${secret}&response=${token}`
      })
      const verifyData = await verifyRes.json()
      if (!verifyData.success) {
        return NextResponse.json({ status: 'error', message: 'Invalid CAPTCHA', url: '' }, { status: 400 })
      }
    }

    // Timer check — must be at least `timer` seconds since the page loaded
    const t = Number(adFormData.t ?? 0)
    const timer = Number(adFormData.timer ?? 5)
    const elapsed = Math.floor(Date.now() / 1000) - Math.floor(t / 1000)
    if (elapsed < timer) {
      return NextResponse.json({ status: 'error', message: 'Too fast', url: '' }, { status: 400 })
    }

    const alias = String(adFormData.alias ?? '')
    const link = await prisma.link.findUnique({
      where: { alias },
      select: { id: true, userId: true, url: true, alias: true, status: true },
    })

    if (!link || link.status === 3) {
      return NextResponse.json({ status: 'error', message: '404 Not Found', url: '' }, { status: 404 })
    }

    let cookieData: { ip: string; id: string } | null = null
    if (parsed.data.cookieData) {
      try {
        cookieData = JSON.parse(Buffer.from(parsed.data.cookieData, 'base64').toString('utf-8'))
      } catch { /* ignore */ }
    }

    const result = await calcEarnings(
      {
        mode: String(adFormData.mode ?? 'simple') as 'simple' | 'campaign',
        alias,
        ci: String(adFormData.ci ?? ''),
        cui: String(adFormData.cui ?? ''),
        cii: String(adFormData.cii ?? ''),
        country: String(adFormData.country ?? 'Others'),
        advertiserPrice: Number(adFormData.advertiserPrice ?? 0),
        publisherPrice: Number(adFormData.publisherPrice ?? 0),
        adType: Number(adFormData.adType ?? 1),
        timer,
        t,
      },
      link,
      Number(adFormData.adType ?? 1),
      ip,
      cookieData,
      parsed.data.hasAdblock,
    )

    return NextResponse.json(result)
  } catch (err) {
    console.error('Go error:', err)
    return NextResponse.json({ status: 'error', message: 'Internal server error', url: '' }, { status: 500 })
  }
}
