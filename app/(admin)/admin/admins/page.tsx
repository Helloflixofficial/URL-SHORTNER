import { prisma } from '@/lib/prisma'
import AdminsClient from './admins-client'
import { redirect } from 'next/navigation'
import { requireOwnerSession } from '@/lib/rbac'

export const metadata = { title: 'Admin — Manage Admins' }

export default async function AdminsPage() {
  if (!(await requireOwnerSession())) {
    redirect('/admin')
  }

  const admins = await prisma.user.findMany({
    where: {
      role: { in: ['admin', 'owner'] }
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, username: true, email: true, role: true, status: true, avatar: true, createdAt: true }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-display">
          <span className="gradient-text">Manage Admins</span>
        </h1>
        <p className="text-muted-foreground mt-1">Add and manage administrative users</p>
      </div>
      <AdminsClient admins={admins} />
    </div>
  )
}
