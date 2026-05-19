import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized. Only owners can create admins.' }, { status: 403 })
    }

    const { username, email, password, avatar } = await req.json()

    if (!username || !email || !password || password.length < 6) {
      return NextResponse.json({ error: 'Invalid input. Please provide a valid email, username, and a password (min 6 chars).' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const newAdmin = await prisma.user.create({
      data: {
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        avatar: avatar || null,
        balance: 0,
      }
    })

    return NextResponse.json({ success: true, user: { id: newAdmin.id, email: newAdmin.email } })

  } catch (error: any) {
    console.error('Error creating admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
