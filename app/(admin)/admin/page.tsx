import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Link2, DollarSign, ArrowDownToLine, TrendingUp, Eye } from 'lucide-react'

export const metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboardPage() {
  const [totalUsers, totalLinks, totalClicks, totalWithdrawals, pendingWithdrawals, totalEarnings] = await Promise.all([
    prisma.user.count({ where: { role: 'member' } }),
    prisma.link.count({ where: { status: { not: 3 } } }),
    prisma.link.aggregate({ _sum: { hits: true } }),
    prisma.withdrawal.count(),
    prisma.withdrawal.count({ where: { status: 0 } }),
    prisma.statistic.aggregate({ where: { reason: 1 }, _sum: { publisherPrice: true } }),
  ])

  const recentUsers = await prisma.user.findMany({
    where: { role: 'member' },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, username: true, email: true, balance: true, createdAt: true },
  })

  const recentWithdrawals = await prisma.withdrawal.findMany({
    where: { status: 0 },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { user: { select: { username: true } } },
  })

  const stats = [
    { label: 'Total Users', value: totalUsers.toLocaleString(), icon: Users, color: '#7c3aed' },
    { label: 'Total Links', value: totalLinks.toLocaleString(), icon: Link2, color: '#06b6d4' },
    { label: 'Total Clicks', value: (totalClicks._sum.hits ?? 0).toLocaleString(), icon: Eye, color: '#10b981' },
    { label: 'Total Payouts', value: `$${(totalEarnings._sum.publisherPrice ?? 0).toFixed(2)}`, icon: TrendingUp, color: '#f59e0b' },
    { label: 'Withdrawals', value: totalWithdrawals.toLocaleString(), icon: ArrowDownToLine, color: '#8b5cf6' },
    { label: 'Pending Payouts', value: pendingWithdrawals.toLocaleString(), icon: DollarSign, color: '#ef4444' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Admin <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-muted-foreground mt-1">Platform-wide overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="glass border-border/50 stat-card">
            <CardContent className="pt-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}22` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="text-base font-bold">Recent Users</CardTitle></CardHeader>
          <CardContent>
            <div className="divide-y divide-border/30">
              {recentUsers.map((u) => (
                <div key={u.id} className="py-2.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'var(--gradient-primary)' }}>
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
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">{pendingWithdrawals}</span>
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
