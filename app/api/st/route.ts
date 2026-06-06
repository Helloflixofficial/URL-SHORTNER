import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateUniqueAlias, isReservedAlias, isValidAlias } from '@/lib/alias'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const api = searchParams.get('api')
  const url = searchParams.get('url')
  const alias = searchParams.get('alias')

  if (!api || !url) {
    return NextResponse.json({ status: 'error', message: 'Missing parameters' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findFirst({
      where: { apiToken: api },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ status: 'error', message: 'Invalid API Token' }, { status: 403 })
    }

    let destination: URL
    try {
      destination = new URL(url)
    } catch {
      return NextResponse.json({ status: 'error', message: 'Invalid URL' }, { status: 400 })
    }
    if (!['http:', 'https:'].includes(destination.protocol)) {
      return NextResponse.json({ status: 'error', message: 'Only http and https URLs are allowed' }, { status: 400 })
    }

    let newAlias = alias?.trim()
    if (newAlias) {
      if (!isValidAlias(newAlias) || isReservedAlias(newAlias)) {
        return NextResponse.json({ status: 'error', message: 'Invalid or reserved alias' }, { status: 400 })
      }
      const existing = await prisma.link.findUnique({ where: { alias: newAlias } })
      if (existing) {
        return NextResponse.json({ status: 'error', message: 'Alias already taken' }, { status: 400 })
      }
    } else {
      newAlias = await generateUniqueAlias(6, 8)
    }

    // Create link
    const link = await prisma.link.create({
      data: {
        url: destination.toString(),
        alias: newAlias,
        userId: user.id,
        adType: 1, // Default to Interstitial for API links
        status: 1
      }
    })

    const baseUrl = process.env.NEXTAUTH_URL ?? new URL(req.url).origin
    return NextResponse.json({ status: 'success', shortenedUrl: `${baseUrl}/${link.alias}` })
  } catch (err) {
    console.error('Quick Link error:', err)
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 })
  }
}
