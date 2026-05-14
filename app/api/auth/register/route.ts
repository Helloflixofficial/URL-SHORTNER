import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { username, email, password } = parsed.data

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) return NextResponse.json({ error: 'Email already in use' }, { status: 400 })

    const existingUsername = await prisma.user.findUnique({ where: { username } })
    if (existingUsername) return NextResponse.json({ error: 'Username already taken' }, { status: 400 })

    const hashed = await bcrypt.hash(password, 12)

    // Get default plan
    const defaultPlan = await prisma.plan.findFirst({ where: { isDefault: true } })

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashed,
        role: 'member',
        status: 'active',
        ...(defaultPlan ? {
          userPlan: { create: { planId: defaultPlan.id } }
        } : {}),
      },
    })

    return NextResponse.json({ id: user.id, username: user.username, email: user.email })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
