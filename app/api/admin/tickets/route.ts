import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const tickets = await prisma.ticket.findMany({
    where: {
      ...(status !== null ? { status: parseInt(status) } : {})
    },
    include: {
      user: { select: { username: true, email: true } }
    },
    orderBy: { updatedAt: 'desc' }
  })
  return NextResponse.json(tickets)
}
