import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id!
  const body = await req.json()
  const { name, websiteUrl, adType, budget, trafficSource } = body
  if (!name || !websiteUrl || !budget) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  const campaign = await prisma.campaign.create({
    data: { userId, name, websiteUrl, adType: adType ?? 1, budget: parseFloat(budget), trafficSource: trafficSource ?? 1, status: 0 },
  })
  return NextResponse.json(campaign)
}

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id!
  const campaigns = await prisma.campaign.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(campaigns)
}
