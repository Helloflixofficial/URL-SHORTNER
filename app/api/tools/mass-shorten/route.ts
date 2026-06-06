import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateUniqueAlias } from '@/lib/alias'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id!

  try {
    const { urls } = await req.json()
    if (!Array.isArray(urls)) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const baseUrl = process.env.NEXTAUTH_URL ?? new URL(req.url).origin
    const results = []

    // Shorten up to 20 URLs
    const limit = urls.slice(0, 20)
    for (const url of limit) {
      try {
        const destination = new URL(url)
        if (!['http:', 'https:'].includes(destination.protocol)) continue
        const alias = await generateUniqueAlias(6, 8)
        const link = await prisma.link.create({
          data: {
            url: destination.toString(),
            alias,
            userId,
            adType: 1,
            status: 1
          }
        })
        results.push(`${baseUrl}/${link.alias}`)
      } catch {
        continue
      }
    }

    return NextResponse.json({ results })
  } catch (err) {
    console.error('Mass shorten error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
