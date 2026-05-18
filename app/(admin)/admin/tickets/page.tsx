import { prisma } from '@/lib/prisma'
import AdminTicketsTable from '@/components/admin/tickets-table'

export const metadata = { title: 'Manage Support Tickets — Admin' }

export default async function AdminTicketsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; status?: string }> }) {
  const { page: p, q, status } = await searchParams
  const page = Math.max(1, parseInt(p ?? '1'))
  const pageSize = 20
  
  const where = { 
    ...(status !== undefined ? { status: parseInt(status) } : {}),
    ...(q ? { subject: { contains: q } } : {}) 
  }
  
  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({ 
      where, 
      orderBy: { updatedAt: 'desc' }, 
      skip: (page - 1) * pageSize, 
      take: pageSize, 
      include: { user: { select: { username: true } } } 
    }),
    prisma.ticket.count({ where }),
  ])
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-display"><span className="gradient-text">Support Management</span></h1>
        <p className="text-muted-foreground mt-1">{total} total tickets</p>
      </div>
      <AdminTicketsTable tickets={tickets} total={total} page={page} pageSize={pageSize} searchQuery={q ?? ''} />
    </div>
  )
}
