import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Eye, Users, TrendingUp } from 'lucide-react'

export const metadata = { title: 'Admin — Reports' }

export default async function AdminReportsPage() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [totalViews, paidViews, totalEarnings, topCountries, topLinks] = await Promise.all([
    prisma.statistic.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.statistic.count({ where: { createdAt: { gte: thirtyDaysAgo }, reason: 1 } }),
    prisma.statistic.aggregate({ where: { createdAt: { gte: thirtyDaysAgo }, reason: 1 }, _sum: { publisherPrice: true } }),
    prisma.statistic.groupBy({ by: ['country'], where: { createdAt: { gte: thirtyDaysAgo } }, _count: true, orderBy: { _count: { country: 'desc' } }, take: 10 }),
    prisma.link.findMany({ where: { status: { not: 3 } }, orderBy: { hits: 'desc' }, take: 10, select: { alias: true, url: true, hits: true }, }),
  ])

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black font-display"><span className="gradient-text">Reports</span></h1>
        <p className="text-muted-foreground mt-1">Platform analytics — last 30 days</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, chipClass: 'icon-chip-purple' },
          { label: 'Paid Views', value: paidViews.toLocaleString(), icon: BarChart3, chipClass: 'icon-chip-cyan' },
          { label: 'Payouts', value: `$${(totalEarnings._sum.publisherPrice ?? 0).toFixed(2)}`, icon: TrendingUp, chipClass: 'icon-chip-green' },
        ].map(s => (
          <Card key={s.label} className="glass border-border/50 stat-card">
            <CardContent className="pt-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.chipClass}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black font-display">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="text-base">Top Countries</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topCountries.map((c, i) => (
                <div key={c.country} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <span className="text-sm flex-1">{c.country}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full gradient-bg-primary" style={{ width: `${(c._count / (topCountries[0]?._count ?? 1)) * 100}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">{c._count}</span>
                </div>
              ))}
              {topCountries.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="text-base">Top Links</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topLinks.map((l, i) => (
                <div key={l.alias} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <span className="text-sm text-primary font-mono flex-1 truncate">/{l.alias}</span>
                  <span className="text-xs font-semibold">{l.hits.toLocaleString()}</span>
                </div>
              ))}
              {topLinks.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No links yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
