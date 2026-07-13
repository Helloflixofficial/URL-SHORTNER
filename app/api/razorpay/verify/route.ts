import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyRazorpaySignature } from '@/lib/razorpay'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json()

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: 'Missing payment verification data' }, { status: 400 })
    }

    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId },
      include: { invoice: true },
    })

    if (!payment || payment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    try {
      verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
    } catch (error) {
      await prisma.payment.update({
        where: { razorpayOrderId },
        data: { status: 'failed', razorpayPaymentId, razorpaySignature },
      })

      return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 })
    }

    const invoice = payment.invoice
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found for payment' }, { status: 404 })
    }

    if (invoice.status === 1) {
      return NextResponse.json({ success: true })
    }

    await prisma.$transaction([
      prisma.payment.update({
        where: { razorpayOrderId },
        data: {
          razorpayPaymentId,
          razorpaySignature,
          status: 'paid',
        },
      }),
      prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 1,
          meta: JSON.stringify({
            ...JSON.parse(invoice.meta || '{}'),
            razorpayPaymentId,
            razorpaySignature,
          }),
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { balance: { increment: payment.amount } },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Razorpay verification failed:', err)
    return NextResponse.json({ error: 'Unable to verify payment' }, { status: 500 })
  }
}
