import { prisma } from '@/lib/prisma'
import AdminLinksTable from '@/components/admin/links-table'

export const metadata = { title: 'Admin — Links' }

export default async function AdminLinksPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const { page: p, q } = await searchParams
  const page = Math.max(1, parseInt(p ?? '1'))
  const pageSize = 20
  const where = { status: { not: 3 as const }, ...(q ? { OR: [{ alias: { contains: q } }, { url: { contains: q } }] } : {}) }
  const [links, total] = await Promise.all([
    prisma.link.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize, include: { user: { select: { username: true } } } }),
    prisma.link.count({ where }),
  ])
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black font-display"><span className="gradient-text">All Links</span></h1>
        <p className="text-muted-foreground mt-1">{total} active links</p></div>
      <AdminLinksTable links={links} total={total} page={page} pageSize={pageSize} searchQuery={q ?? ''} />
    </div>
  )
}
