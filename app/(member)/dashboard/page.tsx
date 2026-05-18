import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Link2, TrendingUp, DollarSign, Eye, Plus, ArrowRight, BarChart3, Bell,
} from 'lucide-react'
import { formatDistanceToNow, startOfDay } from 'date-fns'
import StatsCharts from '@/components/member/stats-charts'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const userId = session.user.id!

  const startOfToday = startOfDay(new Date())

  const [user, totalLinks, totalHits, recentLinks, earnings, todayEarnings, referralsCount, rawCountryStats, rawDeviceStats, rawDailyStats, announcements] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { balance: true, totalEarned: true, username: true } }),
    prisma.link.count({ where: { userId, status: { not: 3 } } }),
    prisma.link.aggregate({ where: { userId, status: { not: 3 } }, _sum: { hits: true } }),
    prisma.link.findMany({
      where: { userId, status: { not: 3 } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, alias: true, url: true, title: true, hits: true, createdAt: true, adType: true },
    }),
    prisma.statistic.aggregate({ where: { userId, reason: 1 }, _sum: { publisherPrice: true } }),
    prisma.statistic.aggregate({ where: { userId, reason: 1, createdAt: { gte: startOfToday } }, _sum: { publisherPrice: true } }),
    prisma.user.count({ where: { referralId: userId } }),
    prisma.statistic.groupBy({
      by: ['country'],
      where: { userId, reason: 1 },
      _count: { _all: true },
      orderBy: { _count: { country: 'desc' } },
      take: 10,
    }),
    prisma.statistic.groupBy({
      by: ['device'],
      where: { userId, reason: 1 },
      _count: { _all: true },
    }),
    prisma.statistic.findMany({
      where: { userId, reason: 1, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      select: { createdAt: true },
    }),
    prisma.announcement.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 2
    })
  ])

  const countryStats = rawCountryStats.map(c => ({ country: c.country, count: c._count._all }))
  const deviceStats = rawDeviceStats.map(d => ({ device: d.device, count: d._count._all }))
  
  // Day-wise grouping for charts
  const dayMap: Record<string, number> = {}
  rawDailyStats.forEach(s => {
    const day = s.createdAt.toISOString().split('T')[0]
    dayMap[day] = (dayMap[day] || 0) + 1
  })
  const dailyStats = Object.entries(dayMap).map(([date, count]) => ({ date, count }))

  const stats = [
    { label: 'Total Clicks', value: (totalHits._sum.hits ?? 0).toLocaleString(), icon: Eye, chipClass: 'icon-chip-cyan' },
    { label: 'Earnings Today', value: `$${(todayEarnings._sum.publisherPrice ?? 0).toFixed(4)}`, icon: DollarSign, chipClass: 'icon-chip-amber' },
    { label: 'Total Earned', value: `$${(earnings._sum.publisherPrice ?? 0).toFixed(4)}`, icon: TrendingUp, chipClass: 'icon-chip-green' },
    { label: 'Total Referrals', value: referralsCount.toLocaleString(), icon: Link2, chipClass: 'icon-chip-purple' },
  ]

  const adTypeLabel = (t: number) => ({ 0: 'Direct', 1: 'Interstitial', 2: 'Banner', 3: 'Random' }[t] ?? 'Unknown')
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

  return (
    <div className="space-y-8">
      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className={`p-4 rounded-2xl border flex items-start gap-4 ${
              a.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
              a.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              'bg-primary/10 border-primary/20 text-primary'
            }`}>
              <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-white/5 border border-white/10 shadow-sm">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold">{a.title}</p>
                <p className="text-xs opacity-80 mt-0.5">{a.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-display">
            Welcome back, <span className="gradient-text">{user?.username}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here&apos;s your performance overview</p>
        </div>
        <Button asChild className="btn-glow gradient-bg-primary text-primary-foreground">
          <Link href="/links/new"><Plus className="w-4 h-4 mr-2" />New Link</Link>
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <Card key={s.label} className="glass border-border/50 hover:border-primary/20 transition-all stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.chipClass}`}>
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black font-display">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Charts */}
      <StatsCharts countryStats={countryStats} deviceStats={deviceStats} dailyStats={dailyStats} />

      {/* Recent links */}
      <Card className="glass border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Recent Links
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/links" className="text-primary text-sm gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentLinks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Link2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No links yet</p>
              <p className="text-sm mt-1">Create your first short link to start earning</p>
              <Button asChild className="mt-4 btn-glow gradient-bg-primary text-primary-foreground">
                <Link href="/links/new"><Plus className="w-4 h-4 mr-2" />Create Link</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {recentLinks.map((link) => (
                <div key={link.id} className="py-3 flex items-center gap-4 table-row-hover rounded-lg px-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 gradient-bg-card border border-primary/20">
                    <Link2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">
                      {baseUrl}/{link.alias}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{link.hits.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">clicks</p>
                  </div>
                  <div className="shrink-0 hidden sm:block">
                    <span className="text-xs glass border border-border/50 rounded-full px-2 py-0.5">
                      {adTypeLabel(link.adType)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0 hidden md:block">
                    {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
