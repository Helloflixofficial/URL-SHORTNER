import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'
import { canManageTargetRole } from '@/lib/roles'

const roles = ['owner', 'admin', 'member'] as const
const statuses = ['active', 'inactive', 'banned'] as const

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession()
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  })
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!canManageTargetRole(session.user.role, target.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (body.role && !roles.includes(body.role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }
  if (body.status && !statuses.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }
  if (body.role && body.role !== target.role && session.user.role !== 'owner') {
    return NextResponse.json({ error: 'Only the owner can change roles' }, { status: 403 })
  }
  if (target.role === 'owner' && body.role && body.role !== 'owner') {
    const ownerCount = await prisma.user.count({ where: { role: 'owner' } })
    if (ownerCount <= 1) {
      return NextResponse.json({ error: 'At least one owner is required' }, { status: 400 })
    }
  }

  const user = await prisma.user.update({
    where: { id: id },
    data: {
      ...(body.status ? { status: body.status } : {}),
      ...(body.balance !== undefined ? { balance: parseFloat(body.balance) } : {}),
      ...(body.role ? { role: body.role } : {}),
    },
  })
  return NextResponse.json(user)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    })
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (target.role === 'owner' || !canManageTargetRole(session.user.role, target.role)) {
      return NextResponse.json({ error: 'Forbidden: you cannot delete this user' }, { status: 403 })
    }

    // Gather dependent IDs so we can delete nested children first
    const campaigns = await prisma.campaign.findMany({
      where: { userId: id },
      select: { id: true },
    })
    const campaignIds = campaigns.map(c => c.id)

    const tickets = await prisma.ticket.findMany({
      where: { userId: id },
      select: { id: true },
    })
    const ticketIds = tickets.map(t => t.id)

    // 1. Delete nested children that have no direct userId FK
    if (campaignIds.length > 0) {
      await prisma.campaignItem.deleteMany({ where: { campaignId: { in: campaignIds } } })
    }
    if (ticketIds.length > 0) {
      await prisma.ticketReply.deleteMany({ where: { ticketId: { in: ticketIds } } })
    }

    // 2. Clear referralId on users referred by this user (avoid orphaned references)
    await prisma.user.updateMany({ where: { referralId: id }, data: { referralId: null } })

    // 3. Delete all direct user-owned records
    await prisma.statistic.deleteMany({ where: { userId: id } })
    await prisma.campaign.deleteMany({ where: { userId: id } })
    await prisma.withdrawal.deleteMany({ where: { userId: id } })
    await prisma.invoice.deleteMany({ where: { userId: id } })
    await prisma.ticket.deleteMany({ where: { userId: id } })
    await prisma.link.deleteMany({ where: { userId: id } })
    await prisma.userPlan.deleteMany({ where: { userId: id } })

    // 4. Finally delete the user
    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    console.error('[DELETE /api/admin/users/[id]]', error)
    return NextResponse.json({ error: 'Internal server error while deleting user' }, { status: 500 })
  }
}
