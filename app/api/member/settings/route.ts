import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id!
  const { username, email, disableEarnings } = await req.json()

  if (username) {
    const exists = await prisma.user.findFirst({ where: { username, id: { not: userId } } })
    if (exists) return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
  }
  if (email) {
    const exists = await prisma.user.findFirst({ where: { email, id: { not: userId } } })
    if (exists) return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { ...(username ? { username } : {}), ...(email ? { email } : {}), ...(disableEarnings !== undefined ? { disableEarnings } : {}) },
  })
  return NextResponse.json({ ok: true })
}
