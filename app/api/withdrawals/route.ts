import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  amount: z.number().positive(),
  method: z.enum(['paypal', 'bank', 'crypto', 'razorpay']),
  accountDetails: z.string().min(5),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id!
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  const { amount, method, accountDetails } = parsed.data

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { balance: true } })
  if (!user || user.balance < amount) return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })

  const minWithdrawalRaw = await prisma.option.findUnique({ where: { key: 'min_withdrawal' } })
  const minWithdrawal = parseFloat(minWithdrawalRaw?.value || '5')
  if (amount < minWithdrawal) return NextResponse.json({ error: `Minimum withdrawal is $${minWithdrawal}` }, { status: 400 })

  const pending = await prisma.withdrawal.count({ where: { userId, status: 0 } })
  if (pending > 0) return NextResponse.json({ error: 'You already have a pending withdrawal request' }, { status: 400 })

  // Deduct balance and create withdrawal in a transaction
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { balance: { decrement: amount } } }),
    prisma.withdrawal.create({ data: { userId, amount, method, accountDetails, status: 0 } })
  ])
  
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id!
  const withdrawals = await prisma.withdrawal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(withdrawals)
}
