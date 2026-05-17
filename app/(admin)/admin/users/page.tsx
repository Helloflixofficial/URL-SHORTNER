import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AdminUsersTable from '@/components/admin/users-table'

export const metadata = { title: 'Admin — Users' }

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const { page: pageParam, q } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1'))
  const pageSize = 20
  const where = q ? {
    OR: [{ username: { contains: q } }, { email: { contains: q } }]
  } : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true, username: true, email: true, role: true, status: true, balance: true, totalEarned: true, createdAt: true },
    }),
    prisma.user.count({ where }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-display">
          <span className="gradient-text">Users</span>
        </h1>
        <p className="text-muted-foreground mt-1">{total} users registered</p>
      </div>
      <AdminUsersTable users={users} total={total} page={page} pageSize={pageSize} searchQuery={q ?? ''} />
    </div>
  )
}
