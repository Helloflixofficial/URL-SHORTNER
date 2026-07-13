import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id!
  const { 
    username, disableEarnings,
    firstName, lastName, address1, address2,
    city, state, zip, country,
    withdrawalMethod, withdrawalAccount
  } = await req.json()

  if (username) {
    const exists = await prisma.user.findFirst({ where: { username, id: { not: userId } } })
    if (exists) return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
  }
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { 
      ...(username ? { username } : {}), 
      ...(disableEarnings !== undefined ? { disableEarnings } : {}),
      firstName, lastName, address1, address2,
      city, state, zip, country,
      withdrawalMethod, withdrawalAccount
    },
  })
  return NextResponse.json({ ok: true })
}
