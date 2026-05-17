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
  
  const amount = parseFloat(budget)
  if (isNaN(amount) || amount <= 0) return NextResponse.json({ error: 'Invalid budget' }, { status: 400 })

  // Check balance
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { balance: true } })
  if (!user || user.balance < amount) return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })

  const campaign = await prisma.$transaction(async (tx) => {
    // Deduct balance immediately
    await tx.user.update({ where: { id: userId }, data: { balance: { decrement: amount } } })

    const c = await tx.campaign.create({
      data: { userId, name, websiteUrl, adType: adType ?? 1, budget: amount, trafficSource: trafficSource ?? 1, status: 0 },
    })

    // Create default CampaignItem for 'all' countries
    // In Adlinkfly, advertisers pay a fixed rate. We'll set default prices.
    await tx.campaignItem.create({
      data: {
        campaignId: c.id,
        country: 'all',
        advertiserPrice: 0.005, // $5 per 1000 views
        publisherPrice: 0.003,  // $3 per 1000 views
        weight: 0
      }
    })

    return c
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
