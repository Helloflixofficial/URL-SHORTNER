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
      await prisma.invoice.deleteMany({
        where: { id: { in: ids } },
      })
    } else if (action === 'approve') {
      // Find all pending invoices in the ids list
      const invoices = await prisma.invoice.findMany({
        where: { id: { in: ids }, status: 0 },
      })

      await prisma.$transaction(async (tx) => {
        // Mark them as paid
        await tx.invoice.updateMany({
          where: { id: { in: invoices.map(i => i.id) } },
          data: { status: 1 },
        })

        // Credit the users' advertiser balances
        for (const inv of invoices) {
          await tx.user.update({
            where: { id: inv.userId },
            data: { balance: { increment: inv.amount } }
          })
        }
      })
    } else if (action === 'reject') {
      await prisma.invoice.updateMany({
        where: { id: { in: ids }, status: 0 },
        data: { status: 2 }, // 2 = Failed/Canceled
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Mass invoice action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
