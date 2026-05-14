import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Globe, Monitor, Link2, TrendingUp } from 'lucide-react'
import StatsCharts from '@/components/member/stats-charts'

export const metadata = { title: 'Link Statistics' }

export default async function LinkStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const { id } = await params
  const userId = session.user.id!
  const linkId = id

  const link = await prisma.link.findUnique({ where: { id: linkId } })
  if (!link || link.userId !== userId) notFound()

  const [totalViews, earnings, countryStats, deviceStats, dailyStats] = await Promise.all([
    prisma.statistic.count({ where: { linkId } }),
    prisma.statistic.aggregate({ where: { linkId, reason: 1 }, _sum: { publisherPrice: true } }),
    prisma.statistic.groupBy({ by: ['country'], where: { linkId }, _count: true, orderBy: { _count: { country: 'desc' } }, take: 10 }),
    prisma.statistic.groupBy({ by: ['device'], where: { linkId }, _count: true }),
    prisma.statistic.groupBy({
      by: ['createdAt'],
      where: { linkId, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      _count: true,
    }),
  ])

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Link <span className="gradient-text">Statistics</span>
        </h1>
        <p className="text-muted-foreground mt-1 font-mono text-sm">{baseUrl}/{link.alias}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Clicks', value: link.hits.toLocaleString(), icon: Link2, color: '#7c3aed' },
          { label: 'Total Views', value: totalViews.toLocaleString(), icon: BarChart3, color: '#06b6d4' },
          { label: 'Earnings', value: `$${(earnings._sum.publisherPrice ?? 0).toFixed(4)}`, icon: TrendingUp, color: '#10b981' },
          { label: 'Countries', value: countryStats.length.toString(), icon: Globe, color: '#f59e0b' },
        ].map((s) => (
          <Card key={s.label} className="glass border-border/50 stat-card">
            <CardContent className="pt-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}22` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <p className="text-xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <StatsCharts
        countryStats={countryStats.map(c => ({ country: c.country, count: c._count }))}
        deviceStats={deviceStats.map(d => ({ device: d.device, count: d._count }))}
        dailyStats={dailyStats.map(d => ({ date: d.createdAt.toISOString().split('T')[0], count: d._count }))}
      />
    </div>
  )
}
