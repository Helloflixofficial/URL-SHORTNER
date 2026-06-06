import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminShell from '@/components/admin/admin-shell'
import { requireAdminSession } from '@/lib/rbac'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession()
  if (!session?.user) redirect('/login')
  const role = session.user.role

  // Count items needing admin action: pending withdrawals + open support tickets
  const [pendingWithdrawals, openTickets] = await Promise.all([
    prisma.withdrawal.count({ where: { status: 0 } }),
    prisma.ticket.count({ where: { status: 0 } }),
  ])
  const pendingCount = pendingWithdrawals + openTickets

  return (
    <AdminShell
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: role,
      }}
      pendingCount={pendingCount}
    >
      {children}
    </AdminShell>
  )
}
