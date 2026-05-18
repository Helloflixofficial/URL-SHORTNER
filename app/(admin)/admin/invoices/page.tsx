import { prisma } from '@/lib/prisma'
import AdminInvoicesTable from '@/components/admin/invoices-table'

export const metadata = { title: 'Manage Invoices — Admin' }

export default async function AdminInvoicesPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; status?: string }> }) {
  const { page: p, q, status } = await searchParams
  const page = Math.max(1, parseInt(p ?? '1'))
  const pageSize = 20
  
  const where = { 
    ...(status !== undefined ? { status: parseInt(status) } : {}),
    ...(q ? { user: { OR: [{ username: { contains: q } }, { email: { contains: q } }] } } : {}) 
  }
  
  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({ 
      where, 
      orderBy: { createdAt: 'desc' }, 
      skip: (page - 1) * pageSize, 
      take: pageSize, 
      include: { user: { select: { username: true, email: true } } } 
    }),
    prisma.invoice.count({ where }),
  ])
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-display"><span className="gradient-text">Manage Invoices</span></h1>
        <p className="text-muted-foreground mt-1">{total} total invoices</p>
      </div>
      <AdminInvoicesTable invoices={invoices} total={total} page={page} pageSize={pageSize} searchQuery={q ?? ''} />
    </div>
  )
}
