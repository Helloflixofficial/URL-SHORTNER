import { prisma } from '@/lib/prisma'
import AdminWithdrawalsTable from '@/components/admin/withdrawals-table'

export const metadata = { title: 'Admin — Withdrawals' }

export default async function AdminWithdrawalsPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string }> }) {
  const { page: pageParam, status } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1'))
  const pageSize = 20
  const where = status !== undefined && status !== '' ? { status: parseInt(status) } : {}

  const [withdrawals, total] = await Promise.all([
    prisma.withdrawal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { username: true, email: true } } },
    }),
    prisma.withdrawal.count({ where }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <span className="gradient-text">Withdrawals</span>
        </h1>
        <p className="text-muted-foreground mt-1">{total} total requests</p>
      </div>
      <AdminWithdrawalsTable withdrawals={withdrawals} total={total} page={page} pageSize={pageSize} />
    </div>
  )
}
