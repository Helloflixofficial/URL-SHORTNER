import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOwnerSession } from '@/lib/rbac'

export async function POST(req: Request) {
  try {
    if (!(await requireOwnerSession())) {
      return NextResponse.json({ error: 'Unauthorized. Only owners can create admins.' }, { status: 403 })
    }

    const { username, email, avatar } = await req.json()

    if (!username || !email) {
      return NextResponse.json({ error: 'Invalid input. Please provide a username and email.' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      if (existingUser.role === 'owner') {
        return NextResponse.json({ error: 'The owner account cannot be changed here' }, { status: 400 })
      }

      const updatedAdmin = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          username,
          role: 'admin',
          status: 'active',
          avatar: avatar || existingUser.avatar,
        },
      })

      return NextResponse.json({ success: true, user: { id: updatedAdmin.id, email: updatedAdmin.email } })
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUsername) {
      return NextResponse.json({ error: 'A user with this username already exists' }, { status: 400 })
    }

    const newAdmin = await prisma.user.create({
      data: {
        username,
        email: email.toLowerCase(),
        role: 'admin',
        status: 'active',
        avatar: avatar || null,
        balance: 0,
      }
    })

    return NextResponse.json({ success: true, user: { id: newAdmin.id, email: newAdmin.email } })

  } catch (error: unknown) {
    console.error('Error creating admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
