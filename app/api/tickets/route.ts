import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tickets = await prisma.ticket.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' }
  })
  return NextResponse.json(tickets)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { subject, message, priority } = await req.json()
    if (!subject || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const ticket = await prisma.ticket.create({
      data: {
        userId: session.user.id!,
        subject,
        priority: parseInt(priority || '0'),
        status: 0,
        replies: {
          create: {
            userId: session.user.id!,
            message,
            isAdmin: false
          }
        }
      }
    })

    return NextResponse.json(ticket)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
