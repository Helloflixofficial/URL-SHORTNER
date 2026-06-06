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

    const targetStatus = action === 'approve' ? 1 : action === 'reject' ? 2 : null
    if (targetStatus === null) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where: { id: { in: ids }, status: 0 },
      select: { id: true, userId: true, amount: true, status: true }
    })

    if (withdrawals.length === 0) {
      return NextResponse.json({ error: 'No pending withdrawals found in selection' }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      // Update all to the new status
      const validIds = withdrawals.map(w => w.id)
      await tx.withdrawal.updateMany({
        where: { id: { in: validIds } },
        data: { status: targetStatus }
      })

      // If rejected, refund the balance for each user
      if (targetStatus === 2) {
        for (const w of withdrawals) {
          await tx.user.update({
            where: { id: w.userId },
            data: { balance: { increment: w.amount } }
          })
        }
      }
    })

    return NextResponse.json({ ok: true, processed: withdrawals.length })
  } catch (err) {
    console.error('Mass withdrawal error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
