import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, MessageSquare, Clock, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export const metadata = { title: 'Support Tickets — Linksite' }

export default async function TicketsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const tickets = await prisma.ticket.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' }
  })

  const statusMap = {
    0: { label: 'Open', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Clock },
    1: { label: 'Answered', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: CheckCircle2 },
    2: { label: 'Closed', color: 'text-muted-foreground bg-white/5 border-white/10', icon: XCircle },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-display">
            Support <span className="gradient-text">Tickets</span>
          </h1>
          <p className="text-muted-foreground mt-1">Need help? Create a ticket and we&apos;ll get back to you.</p>
        </div>
        <Button asChild className="btn-glow gradient-bg-primary text-primary-foreground">
          <Link href="/tickets/new"><Plus className="w-4 h-4 mr-2" /> New Ticket</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tickets.map((t) => {
          const s = statusMap[t.status as keyof typeof statusMap]
          return (
            <Link key={t.id} href={`/tickets/${t.id}`}>
              <Card className="glass border-border/50 hover:border-primary/30 transition-all group overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center p-6 gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate mb-1 group-hover:text-primary transition-colors">{t.subject}</h3>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Updated {formatDistanceToNow(new Date(t.updatedAt), { addSuffix: true })}
                        </span>
                        <span>ID: #{t.id.slice(-6).toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${s.color}`}>
                        <s.icon className="w-3 h-3" /> {s.label}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        Priority: {t.priority === 0 ? 'Low' : t.priority === 1 ? 'Medium' : 'High'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}

        {tickets.length === 0 && (
          <div className="text-center py-20 glass rounded-3xl border border-dashed border-border/50">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No tickets found</h3>
            <p className="text-muted-foreground mb-6">You haven&apos;t created any support tickets yet.</p>
            <Button asChild variant="outline">
              <Link href="/tickets/new">Create your first ticket</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
