import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X, Clock, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import AdminInvoiceActions from '@/components/admin/invoice-actions'

export const metadata = { title: 'Manage Invoices — Admin' }

export default async function AdminInvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { username: true, email: true } } }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-display">
          Manage <span className="gradient-text">Invoices</span>
        </h1>
        <p className="text-muted-foreground mt-1">Approve or reject advertiser deposits</p>
      </div>

      <Card className="glass border-border/50">
        <CardHeader><CardTitle>Deposit Requests</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30">
                  <th className="px-4 py-3 text-xs font-bold uppercase text-muted-foreground">User</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Method</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {invoices.map((inv) => {
                  const meta = JSON.parse(inv.meta || '{}')
                  return (
                    <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4">
                        <p className="text-sm font-bold">{inv.user.username}</p>
                        <p className="text-xs text-muted-foreground">{inv.user.email}</p>
                      </td>
                      <td className="px-4 py-4 text-sm font-black text-primary">${inv.amount.toFixed(2)}</td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium capitalize">{inv.method}</p>
                        <p className="text-[10px] font-mono text-muted-foreground break-all max-w-[150px]">ID: {meta.txnId || 'N/A'}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          inv.status === 0 ? 'border-amber-500/50 text-amber-500 bg-amber-500/10' :
                          inv.status === 1 ? 'border-emerald-500/50 text-emerald-500 bg-emerald-500/10' :
                          'border-red-500/50 text-red-500 bg-red-500/10'
                        }`}>
                          {inv.status === 0 ? 'Pending' : inv.status === 1 ? 'Paid' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(inv.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-4">
                        {inv.status === 0 && <AdminInvoiceActions invoiceId={inv.id} />}
                      </td>
                    </tr>
                  )
                })}
                {invoices.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No invoices found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
