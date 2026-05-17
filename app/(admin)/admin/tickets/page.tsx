import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Clock, CheckCircle2, XCircle, User } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export const metadata = { title: 'Manage Support Tickets — Admin' }

export default async function AdminTicketsPage() {
  const tickets = await prisma.ticket.findMany({
    include: { user: { select: { username: true } } },
    orderBy: { updatedAt: 'desc' }
  })

  const statusMap = {
    0: { label: 'Open', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Clock },
    1: { label: 'Answered', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: CheckCircle2 },
    2: { label: 'Closed', color: 'text-muted-foreground bg-white/5 border-white/10', icon: XCircle },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-display">
          Support <span className="gradient-text">Management</span>
        </h1>
        <p className="text-muted-foreground mt-1">Manage and respond to user help requests</p>
      </div>

      <Card className="glass border-border/50">
        <CardHeader><CardTitle>All Support Tickets</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30">
                  <th className="px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Ticket</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-muted-foreground">User</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Priority</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-muted-foreground">Last Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {tickets.map((t) => {
                  const s = statusMap[t.status as keyof typeof statusMap]
                  return (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors cursor-pointer group">
                      <td className="px-4 py-4">
                        <Link href={`/admin/tickets/${t.id}`} className="block">
                          <p className="text-sm font-bold group-hover:text-primary transition-colors">{t.subject}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">#{t.id.toUpperCase()}</p>
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-3 h-3 text-primary" />
                          </div>
                          <p className="text-xs font-medium">{t.user.username}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.priority === 2 ? 'bg-red-500/10 text-red-500' :
                          t.priority === 1 ? 'bg-amber-500/10 text-amber-500' :
                          'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {t.priority === 0 ? 'Low' : t.priority === 1 ? 'Medium' : 'High'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border flex items-center gap-1.5 w-fit ${s.color}`}>
                          <s.icon className="w-3 h-3" /> {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(t.updatedAt), { addSuffix: true })}
                      </td>
                    </tr>
                  )
                })}
                {tickets.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No support tickets found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
