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
      await prisma.campaign.deleteMany({
        where: { id: { in: ids }, userId },
      })
    } else if (action === 'pause') {
      await prisma.campaign.updateMany({
        where: { id: { in: ids }, userId, status: 1 }, // Only pause if active
        data: { status: 2 },
      })
    } else if (action === 'resume') {
      await prisma.campaign.updateMany({
        where: { id: { in: ids }, userId, status: 2 }, // Only resume if paused
        data: { status: 1 },
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Member mass campaign error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
