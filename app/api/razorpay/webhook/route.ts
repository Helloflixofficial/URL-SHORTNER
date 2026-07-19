import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing Razorpay signature' }, { status: 400 })
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.warn('RAZORPAY_WEBHOOK_SECRET is not configured. Webhook request skipped.')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== signature) {
      console.error('Invalid Razorpay webhook signature.')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)

    // Check if the event is a successful payment capture or order completion
    if (event.event === 'order.paid' || event.event === 'payment.captured') {
      const payload = event.payload.payment?.entity || event.payload.order?.entity
      if (!payload) {
        return NextResponse.json({ error: 'Invalid payload structure' }, { status: 400 })
      }

      const razorpayOrderId = payload.order_id
      const razorpayPaymentId = payload.id
      const razorpaySignature = signature // Using the webhook signature as verification proof

      if (!razorpayOrderId || !razorpayPaymentId) {
        return NextResponse.json({ error: 'Missing payment IDs' }, { status: 400 })
      }

      // Find the corresponding payment request
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId },
        include: { invoice: true },
      })

      if (!payment) {
        console.warn(`Payment request with Razorpay Order ID ${razorpayOrderId} not found.`)
        return NextResponse.json({ status: 'ignored', message: 'Payment not found' })
      }

      // Check if invoice exists and is already processed
      const invoice = payment.invoice
      if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found for payment' }, { status: 404 })
      }

      if (invoice.status === 1) {
        // Already processed via client redirect verify callback
        return NextResponse.json({ status: 'already_processed' })
      }

      // Perform transaction to mark paid and credit user balance
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
              processedVia: 'webhook',
            }),
          },
        }),
        prisma.user.update({
          where: { id: payment.userId },
          data: { balance: { increment: payment.amount } },
        }),
      ])

      console.log(`Successfully credited user ${payment.userId} with $${payment.amount} via Razorpay Webhook.`)
      return NextResponse.json({ success: true, processed: true })
    }

    return NextResponse.json({ status: 'ignored', message: 'Event not handled' })
  } catch (err) {
    console.error('Razorpay Webhook handler failed:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
