import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, ShieldCheck, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import AdminTicketActions from '@/components/admin/ticket-actions'

export const metadata = { title: 'Handle Ticket — Admin' }

export default async function AdminViewTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { 
      user: { select: { username: true, email: true } },
      replies: { orderBy: { createdAt: 'asc' } } 
    }
  })

  if (!ticket) notFound()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-xl">
            <Link href="/admin/tickets"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-black font-display truncate max-w-md">{ticket.subject}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>User: <strong className="text-primary">{ticket.user.username}</strong> ({ticket.user.email})</span>
              <span>•</span>
              <span>ID: #{ticket.id.toUpperCase()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
            ticket.status === 0 ? 'border-amber-500/50 text-amber-500 bg-amber-500/10' :
            ticket.status === 1 ? 'border-emerald-500/50 text-emerald-500 bg-emerald-500/10' :
            'border-white/10 text-muted-foreground bg-white/5'
          }`}>
            {ticket.status === 0 ? 'Open' : ticket.status === 1 ? 'Answered' : 'Closed'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {ticket.replies.map((r) => (
            <div key={r.id} className={`flex ${r.isAdmin ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] space-y-2`}>
                <div className={`flex items-center gap-2 px-1 ${r.isAdmin ? 'justify-end' : ''}`}>
                  {r.isAdmin ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
                      <ShieldCheck className="w-3 h-3" /> You (Support)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase">
                      <User className="w-3 h-3" /> {ticket.user.username}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground">•</span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <Card className={`${r.isAdmin ? 'glass border-primary/20 bg-primary/5' : 'bg-muted/50 border-border/50'} rounded-2xl`}>
                  <CardContent className="p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{r.message}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}

          <Card className="glass border-border/50">
            <CardContent className="p-4">
              <AdminTicketActions ticketId={ticket.id} currentStatus={ticket.status} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass border-border/50">
            <CardHeader><CardTitle className="text-sm">Quick Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Status</p>
                <p className="text-sm font-semibold">{ticket.status === 0 ? 'Waiting for Support' : ticket.status === 1 ? 'Replied' : 'Issue Resolved'}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Priority</p>
                <p className={`text-sm font-black ${ticket.priority === 2 ? 'text-red-500' : ticket.priority === 1 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {ticket.priority === 0 ? 'Low' : ticket.priority === 1 ? 'Medium' : 'High'}
                </p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Created</p>
                <p className="text-xs">{new Date(ticket.createdAt).toLocaleString()}</p></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
