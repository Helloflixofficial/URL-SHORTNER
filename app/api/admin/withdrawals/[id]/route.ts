import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendPayout } from '@/lib/paypal'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { status } = await req.json()
  const withdrawal = await prisma.withdrawal.findUnique({ where: { id: id } })
  if (!withdrawal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // If approving, process PayPal payout if applicable
  if (status === 1 && withdrawal.status === 0) {
    if (withdrawal.method === 'paypal' && process.env.PAYPAL_CLIENT_ID) {
      const payoutRes = await sendPayout(withdrawal.accountDetails, withdrawal.amount, withdrawal.id)
      if (!payoutRes.success) {
        return NextResponse.json({ error: 'PayPal payout failed. Check server logs.' }, { status: 500 })
      }
    }

    await prisma.$transaction([
      prisma.withdrawal.update({ where: { id: id }, data: { status: 1 } }),
      prisma.user.update({ where: { id: withdrawal.userId }, data: { balance: { decrement: withdrawal.amount } } }),
    ])
  } else {
    await prisma.withdrawal.update({ where: { id: id }, data: { status } })
  }
  return NextResponse.json({ ok: true })
}
