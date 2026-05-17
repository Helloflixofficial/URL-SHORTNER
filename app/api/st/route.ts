import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const api = searchParams.get('api')
  const url = searchParams.get('url')
  const alias = searchParams.get('alias')

  if (!api || !url) {
    return NextResponse.json({ status: 'error', message: 'Missing parameters' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { apiToken: api },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ status: 'error', message: 'Invalid API Token' }, { status: 403 })
    }

    // Validate URL
    try { new URL(url) } catch {
      return NextResponse.json({ status: 'error', message: 'Invalid URL' }, { status: 400 })
    }

    // Create link
    const newAlias = alias || nanoid(8)
    const link = await prisma.link.create({
      data: {
        url,
        alias: newAlias,
        userId: user.id,
        adType: 1, // Default to Interstitial for API links
        status: 1
      }
    })

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    return NextResponse.json({ status: 'success', shortenedUrl: `${baseUrl}/${link.alias}` })
  } catch (err) {
    console.error('Quick Link error:', err)
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 })
  }
}
