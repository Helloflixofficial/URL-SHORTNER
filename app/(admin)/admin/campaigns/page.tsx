import { prisma } from '@/lib/prisma'
import AdminCampaignsTable from '@/components/admin/campaigns-table'

export const metadata = { title: 'Admin — Campaigns' }

export default async function AdminCampaignsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; status?: string }> }) {
  const { page: p, q, status } = await searchParams
  const page = Math.max(1, parseInt(p ?? '1'))
  const pageSize = 20
  
  const where = { 
    ...(status !== undefined ? { status: parseInt(status) } : {}),
    ...(q ? { OR: [{ name: { contains: q } }, { websiteUrl: { contains: q } }] } : {}) 
  }
  
  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({ 
      where, 
      orderBy: { createdAt: 'desc' }, 
      skip: (page - 1) * pageSize, 
      take: pageSize, 
      include: { user: { select: { username: true } } } 
    }),
    prisma.campaign.count({ where }),
  ])
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-display"><span className="gradient-text">Campaigns</span></h1>
        <p className="text-muted-foreground mt-1">{total} total campaigns</p>
      </div>
      <AdminCampaignsTable campaigns={campaigns} total={total} page={page} pageSize={pageSize} searchQuery={q ?? ''} />
    </div>
  )
}
