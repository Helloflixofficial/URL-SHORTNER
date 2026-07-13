import 'server-only'

import { auth as clerkAuth, currentUser } from '@clerk/nextjs/server'
import type { UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { isConfiguredOwnerEmail } from '@/lib/roles'

type AppUser = {
  id: string
  clerkUserId: string
  email: string
  name: string | null
  image: string | null
  role: UserRole
}

export type AppSession = {
  user: AppUser
}

function normalizeUsername(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 24)

  return normalized || `user_${Date.now()}`
}

async function getAvailableUsername(seed: string, currentUserId?: string) {
  const base = normalizeUsername(seed)
  let candidate = base
  let suffix = 0

  while (true) {
    const existing = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    })

    if (!existing || existing.id === currentUserId) return candidate

    suffix += 1
    candidate = `${base.slice(0, Math.max(1, 24 - String(suffix).length - 1))}_${suffix}`
  }
}

async function upsertUserFromClerk(clerkUserId: string) {
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const primaryEmail =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress

  if (!primaryEmail) return null

  const usernameSeed =
    clerkUser.username ??
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join('_') ??
    primaryEmail.split('@')[0] ??
    clerkUserId

  const avatar = clerkUser.imageUrl || null
  const role = isConfiguredOwnerEmail(primaryEmail) ? 'owner' : 'member'

  const existingByClerkId = await prisma.user.findUnique({
    where: { clerkUserId },
  })

  if (existingByClerkId) {
    const username = await getAvailableUsername(usernameSeed, existingByClerkId.id)
    return prisma.user.update({
      where: { id: existingByClerkId.id },
      data: {
        email: primaryEmail,
        username,
        avatar,
        emailVerified: clerkUser.primaryEmailAddress?.verification?.status === 'verified'
          ? existingByClerkId.emailVerified ?? new Date()
          : existingByClerkId.emailVerified,
        role: isConfiguredOwnerEmail(primaryEmail) ? 'owner' : existingByClerkId.role,
      },
    })
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: primaryEmail },
  })

  if (existingByEmail) {
    const username = await getAvailableUsername(usernameSeed, existingByEmail.id)
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        clerkUserId,
        username,
        avatar,
        emailVerified: clerkUser.primaryEmailAddress?.verification?.status === 'verified'
          ? existingByEmail.emailVerified ?? new Date()
          : existingByEmail.emailVerified,
        role: isConfiguredOwnerEmail(primaryEmail) ? 'owner' : existingByEmail.role,
      },
    })
  }

  const username = await getAvailableUsername(usernameSeed)

  return prisma.user.create({
    data: {
      clerkUserId,
      username,
      email: primaryEmail,
      avatar,
      role,
      status: 'active',
      emailVerified: clerkUser.primaryEmailAddress?.verification?.status === 'verified' ? new Date() : null,
    },
  })
}

export async function getCurrentDbUser() {
  const { userId } = await clerkAuth()
  if (!userId) return null

  const existingUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  })

  return existingUser ?? upsertUserFromClerk(userId)
}

export async function auth(): Promise<AppSession | null> {
  const { userId } = await clerkAuth()
  if (!userId) return null

  const user = await getCurrentDbUser()
  if (!user || user.status !== 'active') return null

  const role = isConfiguredOwnerEmail(user.email) ? 'owner' : user.role
  if (role === 'owner' && user.role !== 'owner') {
    await prisma.user.update({ where: { id: user.id }, data: { role } })
  }

  if (role !== 'owner' && role !== 'admin' && role !== 'member') {
    return {
      user: {
        id: user.id,
        clerkUserId: userId,
        email: user.email,
        name: user.username,
        image: user.avatar,
        role: 'member',
      },
    }
  }

  return {
    user: {
      id: user.id,
      clerkUserId: userId,
      email: user.email,
      name: user.username,
      image: user.avatar,
      role,
    },
  }
}
