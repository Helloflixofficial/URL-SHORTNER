import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, price, timer, linksLimit, direct, disableAds, disableCaptcha, features, isDefault } = body

    if (isDefault) {
      await prisma.plan.updateMany({ where: { isDefault: true }, data: { isDefault: false } })
    }

    const plan = await prisma.plan.create({
      data: {
        name,
        price: parseFloat(price),
        timer: parseInt(timer),
        linksLimit: parseInt(linksLimit),
        direct: !!direct,
        disableAds: !!disableAds,
        disableCaptcha: !!disableCaptcha,
        features: JSON.stringify(features || []),
        isDefault: !!isDefault
      }
    })

    return NextResponse.json(plan)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
  }
}
