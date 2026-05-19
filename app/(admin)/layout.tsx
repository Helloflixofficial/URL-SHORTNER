import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminShell from '@/components/admin/admin-shell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const role = (session.user as { role?: string }).role
  if (role !== 'admin' && role !== 'owner') redirect('/dashboard')

  // Fetch pending counts for the topbar badge
  const pendingCount = await prisma.announcement.count({ where: { published: true } })

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
