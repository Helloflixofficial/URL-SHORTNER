import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPayout } from '@/lib/paypal'
import { requireAdminSession } from '@/lib/rbac'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminSession()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { status, note } = await req.json()
  
  const withdrawal = await prisma.withdrawal.findUnique({ where: { id } })
  if (!withdrawal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (withdrawal.status !== 0) return NextResponse.json({ error: 'Withdrawal already processed' }, { status: 400 })

  if (status === 1) {
    // Approve
    if (withdrawal.method === 'paypal' && process.env.PAYPAL_CLIENT_ID) {
      const payoutRes = await sendPayout(withdrawal.accountDetails, withdrawal.amount, withdrawal.id)
      if (!payoutRes.success) return NextResponse.json({ error: 'PayPal payout failed' }, { status: 500 })
    }
    await prisma.withdrawal.update({ where: { id }, data: { status: 1, note } })
  } else if (status === 2) {
    // Reject & Refund
    await prisma.$transaction([
      prisma.withdrawal.update({ where: { id }, data: { status: 2, note } }),
      prisma.user.update({ where: { id: withdrawal.userId }, data: { balance: { increment: withdrawal.amount } } })
    ])
  }

  return NextResponse.json({ ok: true })
}
