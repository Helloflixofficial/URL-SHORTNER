import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createRazorpayClient } from '@/lib/razorpay'

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { amount } = await req.json()
        const parsedAmount = Number(amount)

        if (!parsedAmount || parsedAmount < 5) {
            return NextResponse.json({ error: 'Minimum deposit is $5' }, { status: 400 })
        }

        const currency = 'USD'
        const client = createRazorpayClient()
        const razorpayOrder = await client.orders.create({
            amount: Math.round(parsedAmount * 100),
            currency,
            payment_capture: true,
            receipt: `linksite_${Date.now()}`,
        })

        const invoice = await prisma.invoice.create({
            data: {
                userId: session.user.id,
                amount: parsedAmount,
                method: 'razorpay',
                status: 0,
                meta: JSON.stringify({ razorpayOrderId: razorpayOrder.id, currency }),
            },
        })

        await prisma.payment.create({
            data: {
                userId: session.user.id,
                invoiceId: invoice.id,
                razorpayOrderId: razorpayOrder.id,
                amount: parsedAmount,
                currency,
                status: 'created',
            },
        })

        return NextResponse.json({
            success: true,
            orderId: razorpayOrder.id,
            amount: parsedAmount,
            currency,
            key: process.env.RAZORPAY_KEY_ID,
        })
    } catch (err) {
        console.error('Razorpay order creation failed:', err)
        return NextResponse.json({ error: 'Unable to create Razorpay order' }, { status: 500 })
    }
}
