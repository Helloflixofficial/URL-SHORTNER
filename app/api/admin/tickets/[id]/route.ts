import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    const { message, close } = await req.json()
    if (!message && !close) return NextResponse.json({ error: 'Missing action' }, { status: 400 })

    if (message) {
      await prisma.$transaction([
        prisma.ticketReply.create({
          data: { ticketId: id, userId: session.user.id!, message, isAdmin: true }
        }),
        prisma.ticket.update({
          where: { id },
          data: { status: close ? 2 : 1, updatedAt: new Date() } // 1=Answered, 2=Closed
        })
      ])
    } else if (close) {
      await prisma.ticket.update({
        where: { id },
        data: { status: 2, updatedAt: new Date() }
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    const { status } = await req.json()
    const ticket = await prisma.ticket.update({
      where: { id },
      data: { status: parseInt(status) }
    })
    return NextResponse.json(ticket)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
