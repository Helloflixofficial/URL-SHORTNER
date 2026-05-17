import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, Link2, DollarSign, ArrowDownToLine, TrendingUp, Eye, Megaphone, CreditCard } from 'lucide-react'
import AdminCharts from '@/components/admin/admin-charts'

export const metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboardPage() {
  const [totalUsers, totalLinks, totalClicks, totalWithdrawals, pendingWithdrawals, totalEarnings, rawDailyStats, last24hClicks, pendingInvoices] = await Promise.all([
    prisma.user.count({ where: { role: 'member' } }),
    prisma.link.count({ where: { status: { not: 3 } } }),
    prisma.link.aggregate({ _sum: { hits: true } }),
    prisma.withdrawal.count(),
    prisma.withdrawal.count({ where: { status: 0 } }),
    prisma.statistic.aggregate({ where: { reason: 1 }, _sum: { publisherPrice: true } }),
    prisma.statistic.findMany({
      where: { reason: 1, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      select: { createdAt: true, publisherPrice: true },
    }),
    prisma.statistic.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    prisma.invoice.count({ where: { status: 0 } }),
  ])

  // Process global stats
  const viewMap: Record<string, number> = {}
  const revMap: Record<string, number> = {}
  rawDailyStats.forEach(s => {
    const day = s.createdAt.toISOString().split('T')[0]
    viewMap[day] = (viewMap[day] || 0) + 1
    revMap[day] = (revMap[day] || 0) + (s.publisherPrice || 0)
  })
  const dailyViews = Object.entries(viewMap).map(([date, count]) => ({ date, count }))
  const dailyRevenue = Object.entries(revMap).map(([date, amount]) => ({ date, amount }))

  const stats = [
    { label: 'Total Users', value: totalUsers.toLocaleString(), icon: Users, chipClass: 'icon-chip-purple' },
    { label: 'Total Clicks', value: (totalClicks._sum.hits ?? 0).toLocaleString(), icon: Eye, chipClass: 'icon-chip-green' },
    { label: 'Clicks (24h)', value: last24hClicks.toLocaleString(), icon: TrendingUp, chipClass: 'icon-chip-cyan' },
    { label: 'Total Payouts', value: `$${(totalEarnings._sum.publisherPrice ?? 0).toFixed(2)}`, icon: DollarSign, chipClass: 'icon-chip-amber' },
    { label: 'Pending Deposits', value: pendingInvoices.toLocaleString(), icon: ArrowDownToLine, chipClass: 'icon-chip-blue' },
    { label: 'Pending Payouts', value: pendingWithdrawals.toLocaleString(), icon: DollarSign, chipClass: 'icon-chip-red' },
  ]

  const [recentUsers, recentWithdrawals] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'member' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, username: true, email: true, balance: true, createdAt: true },
    }),
    prisma.withdrawal.findMany({
      where: { status: 0 },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: { select: { username: true } } },
    })
  ])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-display">
            Admin <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-1">Platform-wide overview</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="glass border-border/50">
            <Link href="/admin/announcements"><Megaphone className="w-4 h-4 mr-2" /> Notify Users</Link>
          </Button>
          <Button asChild className="btn-glow gradient-bg-primary text-primary-foreground">
            <Link href="/admin/invoices"><CreditCard className="w-4 h-4 mr-2" /> Deposits</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
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
      
      <AdminCharts dailyViews={dailyViews} dailyRevenue={dailyRevenue} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="text-base font-bold">Recent Users</CardTitle></CardHeader>
          <CardContent>
            <div className="divide-y divide-border/30">
              {recentUsers.map((u) => (
                <div key={u.id} className="py-2.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold gradient-bg-primary text-primary-foreground">
                    {u.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{u.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <span className="text-sm font-semibold gradient-text">${u.balance.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="text-base font-bold flex items-center gap-2">
            Pending Withdrawals {pendingWithdrawals > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-primary-foreground text-xs flex items-center justify-center">{pendingWithdrawals}</span>
            )}
          </CardTitle></CardHeader>
          <CardContent>
            {recentWithdrawals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No pending withdrawals</p>
            ) : (
              <div className="divide-y divide-border/30">
                {recentWithdrawals.map((w) => (
                  <div key={w.id} className="py-2.5 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{w.user.username}</p>
                      <p className="text-xs text-muted-foreground capitalize">{w.method}</p>
                    </div>
                    <span className="text-sm font-bold text-amber-400">${w.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
