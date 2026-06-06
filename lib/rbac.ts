import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdminRole, isConfiguredOwnerEmail, isOwnerRole } from '@/lib/roles'

async function getFreshSession() {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true, status: true },
  })
  if (!user || user.status !== 'active') return null

  const role = isConfiguredOwnerEmail(user.email) ? 'owner' : user.role
  if (role === 'owner' && user.role !== 'owner') {
    await prisma.user.update({ where: { id: user.id }, data: { role: 'owner' } })
  }

  return {
    ...session,
    user: {
      ...session.user,
      role,
    },
  }
}

export async function requireAdminSession() {
  const session = await getFreshSession()
  if (!session?.user || !isAdminRole(session.user.role)) return null
  return session
}

export async function requireOwnerSession() {
  const session = await getFreshSession()
  if (!session?.user || !isOwnerRole(session.user.role)) return null
  return session
}
