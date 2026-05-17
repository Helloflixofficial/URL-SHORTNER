import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const api = searchParams.get('api')
  const url = searchParams.get('url')

  if (!api || !url) return NextResponse.redirect(new URL('/', req.url))

  try {
    const user = await prisma.user.findUnique({
      where: { apiToken: api },
      select: { id: true }
    })

    if (!user) return NextResponse.redirect(url)

    // Find if this link already exists for this user to avoid duplicates
    let link = await prisma.link.findFirst({
      where: { userId: user.id, url }
    })

    if (!link) {
      link = await prisma.link.create({
        data: {
          url,
          alias: nanoid(8),
          userId: user.id,
          adType: 1,
          status: 1
        }
      })
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    return NextResponse.redirect(new URL(`/${link.alias}`, req.url))
  } catch (err) {
    return NextResponse.redirect(url)
  }
}
