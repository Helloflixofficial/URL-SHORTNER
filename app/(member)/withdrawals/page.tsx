import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import WithdrawalForm from '@/components/member/withdrawal-form'
import { ArrowDownToLine, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const metadata = { title: 'Withdrawals' }

const statusMap: Record<number, { label: string; icon: typeof Clock; color: string }> = {
  0: { label: 'Pending', icon: Clock, color: 'bg-amber-500/20 text-amber-300' },
  1: { label: 'Approved', icon: CheckCircle, color: 'bg-emerald-500/20 text-emerald-300' },
  2: { label: 'Rejected', icon: XCircle, color: 'bg-red-500/20 text-red-300' },
}

export default async function WithdrawalsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const userId = session.user.id!

  const [user, withdrawals] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { balance: true, totalEarned: true } }),
    prisma.withdrawal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 }),
  ])

  const minWithdrawal = 5

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <span className="gradient-text">Withdrawals</span>
        </h1>
        <p className="text-muted-foreground mt-1">Request payout of your earnings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="glass border-border/50 stat-card">
          <CardContent className="pt-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(124,58,237,0.2)' }}>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-black gradient-text">${(user?.balance ?? 0).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Available Balance</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50 stat-card">
          <CardContent className="pt-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(16,185,129,0.2)' }}>
              <ArrowDownToLine className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-black" style={{ color: '#10b981' }}>${(user?.totalEarned ?? 0).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Earned</p>
          </CardContent>
        </Card>
      </div>

      <WithdrawalForm balance={user?.balance ?? 0} minWithdrawal={minWithdrawal} />

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <ArrowDownToLine className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No withdrawals yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {withdrawals.map((w) => {
                const s = statusMap[w.status] ?? statusMap[0]
                return (
                  <div key={w.id} className="py-3 flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">${w.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{w.method} · {formatDistanceToNow(new Date(w.createdAt), { addSuffix: true })}</p>
                    </div>
                    <span className={`text-xs rounded-full px-2.5 py-1 font-medium ${s.color}`}>{s.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
