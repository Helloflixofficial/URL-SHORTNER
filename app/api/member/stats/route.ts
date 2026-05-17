import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, subDays } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id!
  const now = new Date()
  const thirtyDaysAgo = startOfDay(subDays(now, 30))

  const [dailyStats, countryStats, totalStats] = await Promise.all([
    // Daily views & earnings
    prisma.statistic.groupBy({
      by: ['createdAt'],
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      _sum: { publisherPrice: true }
    }),
    // Top countries
    prisma.statistic.groupBy({
      by: ['country'],
      where: { userId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    }),
    // Totals
    prisma.statistic.aggregate({
      where: { userId },
      _count: { id: true },
      _sum: { publisherPrice: true }
    })
  ])

  // Post-process daily stats to group by actual day (MongoDB createdAt is full ISO)
  const chartDataMap: Record<string, { date: string, views: number, earnings: number }> = {}
  
  // Initialize last 30 days
  for (let i = 0; i <= 30; i++) {
    const d = subDays(now, i).toISOString().split('T')[0]
    chartDataMap[d] = { date: d, views: 0, earnings: 0 }
  }

  dailyStats.forEach(s => {
    const d = s.createdAt.toISOString().split('T')[0]
    if (chartDataMap[d]) {
      chartDataMap[d].views += s._count.id
      chartDataMap[d].earnings += s._sum.publisherPrice || 0
    }
  })

  const chartData = Object.values(chartDataMap).sort((a, b) => a.date.localeCompare(b.date))

  return NextResponse.json({
    chartData,
    countryStats: countryStats.map(c => ({ name: c.country, value: c._count.id })),
    totals: {
      views: totalStats._count.id,
      earnings: totalStats._sum.publisherPrice || 0
    }
  })
}
