import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'

export async function POST(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { invoiceId, status } = await req.json()

    // Status 1 = Approved, 2 = Rejected
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { user: true }
    })

    if (!invoice || invoice.status !== 0) {
      return NextResponse.json({ error: 'Invalid invoice or already processed' }, { status: 400 })
    }

    if (status === 1) {
      // Approve: Increment user balance
      await prisma.$transaction([
        prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: 1 }
        }),
        prisma.user.update({
          where: { id: invoice.userId },
          data: { balance: { increment: invoice.amount } }
        })
      ])
    } else {
      // Reject
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 2 }
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin invoice action error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
