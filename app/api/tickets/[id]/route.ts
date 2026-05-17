import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ticket = await prisma.ticket.findUnique({
    where: { id, userId: session.user.id },
    include: { replies: { orderBy: { createdAt: 'asc' } } }
  })

  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(ticket)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const { message } = await req.json()
    if (!message) return NextResponse.json({ error: 'Missing message' }, { status: 400 })

    const ticket = await prisma.ticket.findUnique({ where: { id, userId: session.user.id } })
    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (ticket.status === 2) return NextResponse.json({ error: 'Ticket is closed' }, { status: 400 })

    const reply = await prisma.$transaction([
      prisma.ticketReply.create({
        data: { ticketId: id, userId: session.user.id!, message, isAdmin: false }
      }),
      prisma.ticket.update({
        where: { id },
        data: { status: 0, updatedAt: new Date() } // Set back to Open if user replies
      })
    ])

    return NextResponse.json(reply[0])
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
