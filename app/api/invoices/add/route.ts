import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id!

  try {
    const { amount, method, txnId } = await req.json()

    if (!amount || amount < 5) {
      return NextResponse.json({ error: 'Minimum deposit is $5' }, { status: 400 })
    }

    if (method === 'razorpay') {
      return NextResponse.json({ error: 'Use the Razorpay checkout option for Razorpay deposits.' }, { status: 400 })
    }

    const invoice = await prisma.invoice.create({
      data: {
        userId,
        amount,
        method,
        status: 0,
        meta: JSON.stringify({ txnId }),
      },
    })

    return NextResponse.json({ success: true, id: invoice.id })
  } catch (err) {
    console.error('Add funds error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
