import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { ArrowLeft, Edit, MessageSquare, ShieldBan, LogIn, Link2, DollarSign, Users, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const p = await params
  const user = await prisma.user.findUnique({ where: { id: p.id } })
  return { title: user ? `User: ${user.username}` : 'User Not Found' }
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params
  const user = await prisma.user.findUnique({
    where: { id: p.id },
    include: {
      userPlan: { include: { plan: true } },
      referrer: { select: { username: true } },
    }
  })

  if (!user) notFound()

  const [
    totalLinks,
    totalHits,
    totalWithdrawn,
    pendingWithdrawn,
    referralsCount,
  ] = await Promise.all([
    prisma.link.count({ where: { userId: user.id } }),
    prisma.link.aggregate({ where: { userId: user.id }, _sum: { hits: true } }),
    prisma.withdrawal.aggregate({ where: { userId: user.id, status: 1 }, _sum: { amount: true } }),
    prisma.withdrawal.aggregate({ where: { userId: user.id, status: 0 }, _sum: { amount: true } }),
    prisma.user.count({ where: { referralId: user.id } }),
  ])

  return (
    <div className="space-y-6">
      {/* Header / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0 text-muted-foreground">
            <Link href="/admin/users"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-black font-display flex items-center gap-2">
              <span className="gradient-text">{user.username}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {user.status}
              </span>
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <form action={`/api/admin/users/${user.id}/impersonate`} method="POST">
            <Button type="submit" variant="outline" className="glass border-border/50 text-xs h-8">
              <LogIn className="w-3.5 h-3.5 mr-1.5" /> Login As
            </Button>
          </form>
          <Button asChild variant="outline" className="glass border-border/50 text-xs h-8">
            <Link href={`/admin/users/${user.id}/edit`}>
              <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit User
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="glass border-border/50 md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-20 h-20 mb-4 ring-2 ring-primary/20">
                <AvatarImage src={user.avatar ?? ''} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-bold">{user.firstName} {user.lastName}</h2>
              <p className="text-muted-foreground text-sm mb-4">Joined {formatDistanceToNow(user.createdAt, { addSuffix: true })}</p>
              
              <div className="w-full grid grid-cols-2 gap-2 text-left mb-6">
                <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Plan</p>
                  <p className="font-semibold text-sm truncate">{user.userPlan?.plan.name ?? 'Free'}</p>
                </div>
                <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Role</p>
                  <p className="font-semibold text-sm capitalize">{user.role}</p>
                </div>
              </div>

              <div className="w-full space-y-3 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground">Country</span>
                  <span className="font-medium">{user.country || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground">Withdraw Method</span>
                  <span className="font-medium capitalize">{user.withdrawalMethod || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground">Referrer</span>
                  <span className="font-medium">{user.referrer?.username || 'None'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="glass border-border/50 stat-card">
            <CardContent className="pt-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 icon-chip-amber">
                <DollarSign className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black font-display">${user.balance.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Current Balance</p>
            </CardContent>
          </Card>
          <Card className="glass border-border/50 stat-card">
            <CardContent className="pt-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 icon-chip-green">
                <DollarSign className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black font-display">${(totalWithdrawn._sum.amount ?? 0).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Withdrawn</p>
            </CardContent>
          </Card>
          <Card className="glass border-border/50 stat-card">
            <CardContent className="pt-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 icon-chip-red">
                <DollarSign className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black font-display">${(pendingWithdrawn._sum.amount ?? 0).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Pending Withdrawals</p>
            </CardContent>
          </Card>
          <Card className="glass border-border/50 stat-card">
            <CardContent className="pt-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 icon-chip-purple">
                <Link2 className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black font-display">{totalLinks.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Links</p>
            </CardContent>
          </Card>
          <Card className="glass border-border/50 stat-card">
            <CardContent className="pt-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 icon-chip-cyan">
                <Eye className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black font-display">{(totalHits._sum.hits ?? 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Clicks</p>
            </CardContent>
          </Card>
          <Card className="glass border-border/50 stat-card">
            <CardContent className="pt-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 icon-chip-pink">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black font-display">{referralsCount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Referred Users</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
