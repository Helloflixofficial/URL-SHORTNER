import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, content, type } = await req.json()
    if (!title || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        type: type || 'info',
        published: true
      }
    })

    return NextResponse.json({ success: true, id: announcement.id })
  } catch (err) {
    console.error('Create announcement error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
