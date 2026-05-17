import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    const body = await req.json()
    const { name, price, timer, linksLimit, direct, disableAds, disableCaptcha, features, isDefault } = body

    if (isDefault) {
      await prisma.plan.updateMany({ where: { isDefault: true, id: { not: id } }, data: { isDefault: false } })
    }

    const plan = await prisma.plan.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(timer !== undefined && { timer: parseInt(timer) }),
        ...(linksLimit !== undefined && { linksLimit: parseInt(linksLimit) }),
        ...(direct !== undefined && { direct: !!direct }),
        ...(disableAds !== undefined && { disableAds: !!disableAds }),
        ...(disableCaptcha !== undefined && { disableCaptcha: !!disableCaptcha }),
        ...(features && { features: JSON.stringify(features) }),
        ...(isDefault !== undefined && { isDefault: !!isDefault })
      }
    })

    return NextResponse.json(plan)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  try {
    await prisma.plan.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 })
  }
}
