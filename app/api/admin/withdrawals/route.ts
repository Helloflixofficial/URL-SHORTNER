import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'

export async function POST(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, status } = await req.json() // 1=Approved, 2=Rejected
    
    const withdrawal = await prisma.withdrawal.findUnique({ 
      where: { id },
      select: { userId: true, amount: true, status: true } 
    })
    
    if (!withdrawal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (withdrawal.status !== 0) return NextResponse.json({ error: 'Already processed' }, { status: 400 })

    await prisma.$transaction(async (tx) => {
      await tx.withdrawal.update({
        where: { id },
        data: { status }
      })

      // If rejected, refund the balance
      if (status === 2) {
        await tx.user.update({
          where: { id: withdrawal.userId },
          data: { balance: { increment: withdrawal.amount } }
        })
      }
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Withdrawal process error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
