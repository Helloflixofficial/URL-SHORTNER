import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Send, User, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import TicketReplyForm from '@/components/member/ticket-reply-form'

export const metadata = { title: 'View Ticket — Linksite' }

export default async function ViewTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params
  const ticket = await prisma.ticket.findUnique({
    where: { id, userId: session.user.id },
    include: { replies: { orderBy: { createdAt: 'asc' } } }
  })

  if (!ticket) notFound()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-xl">
            <Link href="/tickets"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-black font-display truncate max-w-md">{ticket.subject}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Ticket ID: #{ticket.id.toUpperCase()}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
            ticket.status === 0 ? 'border-amber-500/50 text-amber-500 bg-amber-500/10' :
            ticket.status === 1 ? 'border-emerald-500/50 text-emerald-500 bg-emerald-500/10' :
            'border-white/10 text-muted-foreground bg-white/5'
          }`}>
            {ticket.status === 0 ? 'Open' : ticket.status === 1 ? 'Answered' : 'Closed'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {ticket.replies.map((r) => (
          <div key={r.id} className={`flex ${r.isAdmin ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] space-y-2`}>
              <div className="flex items-center gap-2 px-1">
                {r.isAdmin ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
                    <ShieldCheck className="w-3 h-3" /> Support Agent
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase">
                    <User className="w-3 h-3" /> You
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
      </div>

      {ticket.status !== 2 ? (
        <Card className="glass border-border/50 sticky bottom-6">
          <CardContent className="p-4">
            <TicketReplyForm ticketId={ticket.id} />
          </CardContent>
        </Card>
      ) : (
        <div className="text-center p-6 glass rounded-2xl border border-white/10 opacity-60">
          <p className="text-sm font-medium text-muted-foreground">This ticket is closed and cannot be replied to.</p>
        </div>
      )}
    </div>
  )
}
