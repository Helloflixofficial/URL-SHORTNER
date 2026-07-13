import Razorpay from 'razorpay'
import crypto from 'crypto'

export function createRazorpayClient() {
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
        throw new Error('Razorpay keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.')
    }

    return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
        throw new Error('Razorpay secret is not configured')
    }

    const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex')

    return expectedSignature === signature
}
