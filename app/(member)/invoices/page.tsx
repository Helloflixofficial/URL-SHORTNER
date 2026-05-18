import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, CheckCircle, XCircle, Clock, Plus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export const metadata = { title: 'Invoices' }

const STATUS = { 0: { label: 'Pending', icon: Clock, color: 'text-amber-400' }, 1: { label: 'Paid', icon: CheckCircle, color: 'text-emerald-400' }, 2: { label: 'Failed', icon: XCircle, color: 'text-red-400' } }

export default async function InvoicesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const userId = session.user.id!
  const invoices = await prisma.invoice.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-display">
          <span className="gradient-text">Invoices</span>
        </h1>
        <p className="text-muted-foreground mt-1">Your billing history</p>
      </div>
      <div className="flex justify-end">
        <Button asChild className="btn-glow gradient-bg-primary text-primary-foreground">
          <Link href="/invoices/add"><Plus className="w-4 h-4 mr-2" />Add Funds</Link>
        </Button>
      </div>
      <Card className="glass border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" />Invoice History</CardTitle></CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No invoices yet</p>
              <p className="text-sm mt-1">Upgrade your plan to see invoices here</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {invoices.map((inv) => {
                const s = STATUS[inv.status as keyof typeof STATUS] ?? STATUS[0]
                return (
                  <div key={inv.id} className="py-3 flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">${inv.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{inv.method} · {formatDistanceToNow(new Date(inv.createdAt), { addSuffix: true })}</p>
                    </div>
                    <span className={`text-xs font-semibold ${s.color}`}>{s.label}</span>
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
