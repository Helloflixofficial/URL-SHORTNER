import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { Megaphone, CheckCircle, XCircle } from 'lucide-react'

export const metadata = { title: 'Admin — Campaigns' }

const statusLabel = (s: number) => ({ 0: 'Pending', 1: 'Active', 2: 'Paused', 3: 'Completed', 4: 'Rejected' }[s] ?? 'Unknown')
const statusColor = (s: number) => ({ 0: 'text-amber-400', 1: 'text-emerald-400', 2: 'text-blue-400', 3: 'text-gray-400', 4: 'text-red-400' }[s] ?? '')

export default async function AdminCampaignsPage() {
  const campaigns = await prisma.campaign.findMany({ orderBy: { createdAt: 'desc' }, take: 50, include: { user: { select: { username: true } } } })
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}><span className="gradient-text">Campaigns</span></h1>
        <p className="text-muted-foreground mt-1">{campaigns.length} campaigns</p></div>
      {campaigns.length === 0 ? (
        <Card className="glass border-border/50"><CardContent className="py-12 text-center text-muted-foreground"><Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No campaigns yet</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => (
            <Card key={c.id} className="glass border-border/50">
              <CardContent className="py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">by {c.user.username} · {c.websiteUrl}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">${c.budget.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">spent ${c.spent.toFixed(2)}</p>
                </div>
                <span className={`text-xs font-semibold shrink-0 ${statusColor(c.status)}`}>{statusLabel(c.status)}</span>
                {c.status === 0 && (
                  <div className="flex gap-1 shrink-0">
                    <form action={`/api/admin/campaigns/${c.id}/approve`} method="POST"><Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-400"><CheckCircle className="w-4 h-4" /></Button></form>
                    <form action={`/api/admin/campaigns/${c.id}/reject`} method="POST"><Button size="icon" variant="ghost" className="h-7 w-7 text-red-400"><XCircle className="w-4 h-4" /></Button></form>
                  </div>
                )}
                <span className="text-xs text-muted-foreground shrink-0">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
