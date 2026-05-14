import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const user = await prisma.user.update({
    where: { id: id },
    data: {
      ...(body.status ? { status: body.status } : {}),
      ...(body.balance !== undefined ? { balance: parseFloat(body.balance) } : {}),
      ...(body.role ? { role: body.role } : {}),
    },
  })
  return NextResponse.json(user)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.user.delete({ where: { id: id } })
  return NextResponse.json({ ok: true })
}
