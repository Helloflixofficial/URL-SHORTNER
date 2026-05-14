import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    
    // Find user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Return success even if not found to prevent email enumeration
      return NextResponse.json({ success: true })
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Save token to user
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry }
    })

    // Get base URL for email link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (req.headers.get('origin') ?? 'http://localhost:3000')

    // Send email
    await sendPasswordResetEmail(email, resetToken, baseUrl)

    console.log(`[AUTH] Password reset requested for ${email}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
