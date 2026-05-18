import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { action, ids } = await req.json()
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
    }

    if (action === 'delete') {
      await prisma.campaign.deleteMany({
        where: { id: { in: ids } },
      })
    } else if (action === 'approve') {
      await prisma.campaign.updateMany({
        where: { id: { in: ids }, status: 0 },
        data: { status: 1 },
      })
    } else if (action === 'reject') {
      await prisma.campaign.updateMany({
        where: { id: { in: ids }, status: 0 },
        data: { status: 4 },
      })
    } else if (action === 'pause') {
      await prisma.campaign.updateMany({
        where: { id: { in: ids }, status: 1 },
        data: { status: 2 },
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Mass action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
