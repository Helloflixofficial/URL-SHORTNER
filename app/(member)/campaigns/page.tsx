import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Megaphone, BarChart3 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const metadata = { title: 'Campaigns' }

const statusLabel = (s: number) => ({ 0: 'Pending', 1: 'Active', 2: 'Paused', 3: 'Completed', 4: 'Rejected' }[s] ?? 'Unknown')
const statusColor = (s: number) => ({ 0: 'text-amber-400', 1: 'text-emerald-400', 2: 'text-blue-400', 3: 'text-gray-400', 4: 'text-red-400' }[s] ?? 'text-gray-400')
const adTypeLabel = (t: number) => ({ 1: 'Interstitial', 2: 'Banner', 3: 'Popup' }[t] ?? 'Unknown')

export default async function CampaignsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const userId = session.user.id!
  const campaigns = await prisma.campaign.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-display">
            <span className="gradient-text">Campaigns</span>
          </h1>
          <p className="text-muted-foreground mt-1">Advertise your links across the network</p>
        </div>
        <Button asChild className="btn-glow gradient-bg-primary text-primary-foreground">
          <Link href="/campaigns/new"><Plus className="w-4 h-4 mr-2" />New Campaign</Link>
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="glass border-border/50">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No campaigns yet</p>
            <p className="text-sm mt-1 mb-4">Create a campaign to advertise across the Linksite network</p>
            <Button asChild className="btn-glow gradient-bg-primary text-primary-foreground">
              <Link href="/campaigns/new"><Plus className="w-4 h-4 mr-2" />Create Campaign</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {campaigns.map((c) => (
            <Card key={c.id} className="glass border-border/50 hover:border-primary/20 transition-all">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{c.websiteUrl}</p>
                  </div>
                  <span className={`text-xs font-semibold ${statusColor(c.status)}`}>{statusLabel(c.status)}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div><p className="text-xs text-muted-foreground">Type</p><p className="font-medium">{adTypeLabel(c.adType)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Budget</p><p className="font-medium">${c.budget.toFixed(2)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Spent</p><p className="font-medium">${c.spent.toFixed(2)}</p></div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
