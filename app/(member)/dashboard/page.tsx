import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Link2, TrendingUp, DollarSign, Eye, Plus, ArrowRight, BarChart3,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const userId = session.user.id!

  const [user, totalLinks, totalHits, recentLinks, earnings] = await Promise.all([
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
  ])

  const stats = [
    { label: 'Total Links', value: totalLinks.toLocaleString(), icon: Link2, color: '#7c3aed' },
    { label: 'Total Clicks', value: (totalHits._sum.hits ?? 0).toLocaleString(), icon: Eye, color: '#06b6d4' },
    { label: 'Total Earned', value: `$${(earnings._sum.publisherPrice ?? 0).toFixed(4)}`, icon: TrendingUp, color: '#10b981' },
    { label: 'Balance', value: `$${(user?.balance ?? 0).toFixed(2)}`, icon: DollarSign, color: '#f59e0b' },
  ]

  const adTypeLabel = (t: number) => ({ 0: 'Direct', 1: 'Interstitial', 2: 'Banner', 3: 'Random' }[t] ?? 'Unknown')
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Welcome back, <span className="gradient-text">{user?.username}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here&apos;s your performance overview</p>
        </div>
        <Button asChild className="btn-glow" style={{ background: 'var(--gradient-primary)' }}>
          <Link href="/links/new"><Plus className="w-4 h-4 mr-2" />New Link</Link>
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <Card key={s.label} className="glass border-border/50 hover:border-primary/20 transition-all stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}22` }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-2xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

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
              <Button asChild className="mt-4 btn-glow" style={{ background: 'var(--gradient-primary)' }}>
                <Link href="/links/new"><Plus className="w-4 h-4 mr-2" />Create Link</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {recentLinks.map((link) => (
                <div key={link.id} className="py-3 flex items-center gap-4 table-row-hover rounded-lg px-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'var(--gradient-card)', border: '1px solid rgba(124,58,237,0.2)' }}>
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
