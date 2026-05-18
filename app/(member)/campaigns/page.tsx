import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import MemberCampaignsTable from '@/components/member/campaigns-table'

export const metadata = { title: 'Campaigns' }

export default async function CampaignsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; status?: string }> }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const userId = session.user.id!

  const { page: p, q, status } = await searchParams
  const page = Math.max(1, parseInt(p ?? '1'))
  const pageSize = 20
  
  const where = { 
    userId,
    ...(status !== undefined ? { status: parseInt(status) } : {}),
    ...(q ? { OR: [{ name: { contains: q } }, { websiteUrl: { contains: q } }] } : {}) 
  }
  
  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({ 
      where, 
      orderBy: { createdAt: 'desc' }, 
      skip: (page - 1) * pageSize, 
      take: pageSize, 
    }),
    prisma.campaign.count({ where }),
  ])
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-display"><span className="gradient-text">Campaigns</span></h1>
          <p className="text-muted-foreground mt-1">{total} total campaigns</p>
        </div>
        <Button asChild className="btn-glow gradient-bg-primary text-primary-foreground">
          <Link href="/campaigns/new"><Plus className="w-4 h-4 mr-2" />New Campaign</Link>
        </Button>
      </div>
      <MemberCampaignsTable campaigns={campaigns} total={total} page={page} pageSize={pageSize} searchQuery={q ?? ''} />
    </div>
  )
}
