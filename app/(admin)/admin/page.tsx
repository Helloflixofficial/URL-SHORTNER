import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, Link2, DollarSign, ArrowDownToLine, TrendingUp, Eye, Megaphone, CreditCard, MessageSquare, Activity } from 'lucide-react'
import AdminCharts from '@/components/admin/admin-charts'
import { auth } from '@/lib/auth'

export const metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboardPage() {
  const session = await auth()
  const role = session?.user?.role || 'admin'

  const [
    totalUsers, totalLinks, totalClicks, totalWithdrawals, pendingWithdrawals,
    totalEarnings, rawDailyStats, last24hClicks, pendingInvoices,
    openTickets, rawCampaigns, recentUsers, recentWithdrawals, totalCampaigns,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'member' } }),
    prisma.link.count({ where: { status: { not: 3 } } }),
    prisma.link.aggregate({ _sum: { hits: true } }),
    prisma.withdrawal.count(),
    prisma.withdrawal.count({ where: { status: 0 } }),
    prisma.statistic.aggregate({ where: { reason: 1 }, _sum: { publisherPrice: true } }),
    prisma.statistic.findMany({
      where: { reason: 1, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      select: { createdAt: true, publisherPrice: true, advertiserPrice: true },
    }),
    prisma.statistic.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    prisma.invoice.count({ where: { status: 0 } }),
    prisma.ticket.count({ where: { status: 0 } }),
    prisma.campaign.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { user: { select: { username: true } } } }),
    prisma.user.findMany({
      where: { role: 'member' },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, username: true, email: true, balance: true, status: true, createdAt: true },
    }),
    prisma.withdrawal.findMany({
      where: { status: 0 },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: { select: { username: true } } },
    }),
    prisma.campaign.count(),
  ])

  // Build chart data
  const viewMap: Record<string, number> = {}
  const revMap: Record<string, number> = {}
  const pubMap: Record<string, number> = {}
  const ownMap: Record<string, number> = {}
  const refMap: Record<string, number> = {}

  rawDailyStats.forEach(s => {
    const day = s.createdAt.toISOString().split('T')[0]
    viewMap[day] = (viewMap[day] || 0) + 1
    revMap[day] = (revMap[day] || 0) + (s.publisherPrice || 0)
    pubMap[day] = (pubMap[day] || 0) + (s.publisherPrice || 0)
    ownMap[day] = (ownMap[day] || 0) + (s.advertiserPrice || 0)
  })

  const dailyViews = Object.entries(viewMap).map(([date, count]) => ({ date, count }))
  const dailyRevenue = Object.entries(revMap).map(([date, amount]) => ({ date, amount }))
  const allDays = [...new Set([...Object.keys(pubMap), ...Object.keys(ownMap)])]
  const dailyBreakdown = allDays.map(date => ({
    date,
    publisher: pubMap[date] || 0,
    owner: ownMap[date] || 0,
    referral: refMap[date] || 0,
  })).sort((a, b) => a.date.localeCompare(b.date))

  const campaignStatusLabel = (s: number) => ({ 0: 'Pending', 1: 'Active', 2: 'Paused', 3: 'Completed', 4: 'Rejected' }[s] ?? 'Unknown')
  const campaignStatusClass = (s: number) => ({
    0: 'text-amber-400 bg-amber-400/10', 1: 'text-emerald-400 bg-emerald-400/10',
    2: 'text-blue-400 bg-blue-400/10', 3: 'text-muted-foreground bg-muted/30', 4: 'text-red-400 bg-red-400/10',
  }[s] ?? 'text-muted-foreground')

  const stats = [
    { label: 'Total Users', value: totalUsers.toLocaleString(), icon: Users, chipClass: 'icon-chip-purple', href: '/admin/users' },
    { label: 'Total Clicks', value: (totalClicks._sum.hits ?? 0).toLocaleString(), icon: Eye, chipClass: 'icon-chip-green', href: '/admin/links' },
    { label: 'Clicks (24h)', value: last24hClicks.toLocaleString(), icon: TrendingUp, chipClass: 'icon-chip-cyan', href: '/admin/reports' },
    { label: 'Total Payouts', value: `$${(totalEarnings._sum.publisherPrice ?? 0).toFixed(2)}`, icon: DollarSign, chipClass: 'icon-chip-amber', href: '/admin/withdrawals' },
    { label: 'Pending Deposits', value: pendingInvoices.toLocaleString(), icon: ArrowDownToLine, chipClass: 'icon-chip-blue', href: '/admin/invoices' },
    { label: 'Pending Payouts', value: pendingWithdrawals.toLocaleString(), icon: DollarSign, chipClass: 'icon-chip-red', href: '/admin/withdrawals' },
    { label: 'Total Campaigns', value: totalCampaigns.toLocaleString(), icon: Megaphone, chipClass: 'icon-chip-pink', href: '/admin/campaigns' },
    { label: 'Open Tickets', value: openTickets.toLocaleString(), icon: MessageSquare, chipClass: 'icon-chip-purple', href: '/admin/tickets' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display">
            {role === 'owner' ? 'Owner' : 'Admin'} <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Platform-wide overview</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild variant="outline" className="glass border-border/50 flex-1 sm:flex-none">
            <Link href="/admin/announcements"><Megaphone className="w-4 h-4 mr-2" /> Notify Users</Link>
          </Button>
          <Button asChild className="btn-glow gradient-bg-primary text-primary-foreground flex-1 sm:flex-none">
            <Link href="/admin/invoices"><CreditCard className="w-4 h-4 mr-2" /> Deposits</Link>
          </Button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="glass border-border/50 stat-card cursor-pointer">
              <CardContent className="pt-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.chipClass}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black font-display">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <AdminCharts dailyViews={dailyViews} dailyRevenue={dailyRevenue} dailyBreakdown={dailyBreakdown} />

      {/* Bottom tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold">Recent Users</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users" className="text-xs text-primary">View all →</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/30">
              {recentUsers.map((u) => (
                <Link key={u.id} href={`/admin/users/${u.id}`} className="py-2.5 flex items-center gap-3 table-row-hover rounded-lg px-1 -mx-1">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold gradient-bg-primary text-primary-foreground shrink-0">
                    {u.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{u.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.status === 'active' ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                    {u.status}
                  </span>
                  <span className="text-sm font-semibold gradient-text shrink-0">${u.balance.toFixed(2)}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Withdrawals */}
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              Pending Withdrawals
              {pendingWithdrawals > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">{pendingWithdrawals}</span>
              )}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/withdrawals" className="text-xs text-primary">View all →</Link>
            </Button>
          </CardHeader>
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

        {/* Recent Campaigns */}
        <Card className="glass border-border/50 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Recent Campaigns
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/campaigns" className="text-xs text-primary">View all →</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/30">
              {rawCampaigns.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No campaigns yet</p>
              ) : rawCampaigns.map((c) => (
                <div key={c.id} className="py-2.5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.user.username} · {c.websiteUrl}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold">${c.budget.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">budget</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${campaignStatusClass(c.status)}`}>
                    {campaignStatusLabel(c.status)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
