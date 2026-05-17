import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, ShieldCheck, DollarSign, Wallet } from 'lucide-react'
import { format } from 'date-fns'

export const metadata = { title: 'Payment Proofs — Linksite' }

export default async function PayoutsPage() {
  const payouts = await prisma.withdrawal.findMany({
    where: { status: 1 },
    orderBy: { updatedAt: 'desc' },
    take: 30,
    include: { user: { select: { username: true } } }
  })

  const stats = await prisma.withdrawal.aggregate({
    where: { status: 1 },
    _sum: { amount: true },
    _count: { _all: true }
  })

  return (
    <div className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black mb-4 font-display">
            Payment <span className="gradient-text">Proofs</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Transparency is our priority. We have paid over <strong>${(stats._sum.amount || 0).toLocaleString()}</strong> to our publishers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="glass border-border/50 text-center p-6">
            <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-black font-display">${(stats._sum.amount || 0).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground uppercase font-bold">Total Paid</p>
          </Card>
          <Card className="glass border-border/50 text-center p-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-black font-display">{stats._count._all}</p>
            <p className="text-xs text-muted-foreground uppercase font-bold">Transactions</p>
          </Card>
          <Card className="glass border-border/50 text-center p-6">
            <ShieldCheck className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-black font-display">100%</p>
            <p className="text-xs text-muted-foreground uppercase font-bold">Reliability</p>
          </Card>
        </div>

        <Card className="glass border-border/50 overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-border/50">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" /> Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Date</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">User</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-muted-foreground">{format(new Date(p.updatedAt), 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium">{p.user.username.slice(0, 3)}***</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-primary">${p.amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 capitalize">
                          {p.method}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {payouts.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">No payment proofs yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
