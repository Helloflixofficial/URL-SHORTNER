import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const linkId = id
  const userId = session.user.id!
  const isAdmin = (session.user as { role?: string }).role === 'admin'

  const link = await prisma.link.findUnique({ where: { id: linkId } })
  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!isAdmin && link.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.link.update({ where: { id: linkId }, data: { status: 3 } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const linkId = id
  const userId = session.user.id!
  const body = await req.json()

  const link = await prisma.link.findUnique({ where: { id: linkId } })
  if (!link || link.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.link.update({
    where: { id: linkId },
    data: {
      title: body.title ?? link.title,
      adType: body.adType !== undefined ? parseInt(body.adType) : link.adType,
      status: body.status !== undefined ? parseInt(body.status) : link.status,
    },
  })
  return NextResponse.json(updated)
}
