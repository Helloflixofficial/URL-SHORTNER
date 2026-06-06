import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'

export async function POST(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { action, ids } = await req.json()
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
    }

    if (action === 'delete') {
      // First delete associated replies to avoid foreign key constraints
      await prisma.ticketReply.deleteMany({
        where: { ticketId: { in: ids } },
      })
      await prisma.ticket.deleteMany({
        where: { id: { in: ids } },
      })
    } else if (action === 'close') {
      await prisma.ticket.updateMany({
        where: { id: { in: ids } },
        data: { status: 2 }, // 2 = Closed
      })
    } else if (action === 'answer') {
      await prisma.ticket.updateMany({
        where: { id: { in: ids } },
        data: { status: 1 }, // 1 = Answered
      })
    } else if (action === 'open') {
      await prisma.ticket.updateMany({
        where: { id: { in: ids } },
        data: { status: 0 }, // 0 = Open
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Mass ticket action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
