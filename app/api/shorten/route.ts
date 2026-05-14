import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { generateUniqueAlias, isValidAlias, isReservedAlias, RESERVED_ALIASES } from '@/lib/alias'
import { getOption } from '@/lib/options'
import { z } from 'zod'

const shortenSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  alias: z.string().max(30).optional(),
  title: z.string().max(200).optional(),
  adType: z.number().int().min(0).max(4).optional().default(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = shortenSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { url, alias: customAlias, title, adType } = parsed.data

    // Verify scheme
    const scheme = new URL(url).protocol.replace(':', '')
    if (!['http', 'https'].includes(scheme)) {
      return NextResponse.json({ error: 'Only http and https URLs are allowed' }, { status: 400 })
    }

    // Check disallowed domains
    const disallowedRaw = await getOption('disallowed_domains', '')
    if (disallowedRaw) {
      const disallowed = disallowedRaw.split(',').map((d) => d.trim().toLowerCase())
      const host = new URL(url).hostname.toLowerCase()
      if (disallowed.includes(host)) {
        return NextResponse.json({ error: 'This domain is not allowed' }, { status: 400 })
      }
    }

    const session = await auth()
    const userId = session?.user?.id ? session.user.id : "000000000000000000000001" // anonymous

    // Resolve alias
    let alias = customAlias?.trim()
    if (alias) {
      if (!isValidAlias(alias)) {
        return NextResponse.json({ error: 'Alias can only contain letters, numbers, dash and underscore' }, { status: 400 })
      }
      if (isReservedAlias(alias)) {
        return NextResponse.json({ error: 'This alias is reserved' }, { status: 400 })
      }
      const existing = await prisma.link.findUnique({ where: { alias } })
      if (existing) {
        return NextResponse.json({ error: 'Alias already taken' }, { status: 400 })
      }
    } else {
      const minLen = parseInt(await getOption('alias_min_length', '5'))
      const maxLen = parseInt(await getOption('alias_max_length', '7'))
      alias = await generateUniqueAlias(minLen, maxLen)
    }

    // Check links limit
    if (session?.user?.id) {
      const userPlan = await prisma.userPlan.findUnique({
        where: { userId },
        include: { plan: true },
      })
      if (userPlan?.plan.linksLimit !== -1) {
        const count = await prisma.link.count({ where: { userId, status: { not: 3 } } })
        if (count >= (userPlan?.plan.linksLimit ?? 10)) {
          return NextResponse.json({ error: 'You have reached your links limit. Please upgrade your plan.' }, { status: 403 })
        }
      }
    }

    const link = await prisma.link.create({
      data: { url, alias, title: title ?? null, userId, adType: adType ?? 1, status: 1 },
    })

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    return NextResponse.json({
      id: link.id,
      alias: link.alias,
      shortUrl: `${baseUrl}/${link.alias}`,
      url: link.url,
    })
  } catch (err) {
    console.error('Shorten error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
