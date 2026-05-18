import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { action, ids } = await req.json()
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
    }

    const userId = session.user.id

    if (action === 'delete') {
      await prisma.link.deleteMany({
        where: { id: { in: ids }, userId },
      })
    } else if (action === 'hide') {
      await prisma.link.updateMany({
        where: { id: { in: ids }, userId },
        data: { status: 3 }, // 3 is usually hidden/deleted softly
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Member mass link action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
