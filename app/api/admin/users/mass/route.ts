import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'
import { canManageTargetRole } from '@/lib/roles'

export async function POST(req: NextRequest) {
  const session = await requireAdminSession()
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { action, ids } = await req.json()
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
    }

    const targets = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, role: true },
    })
    const manageableIds = targets
      .filter((user) => canManageTargetRole(session.user.role, user.role))
      .filter((user) => action === 'activate' || user.role !== 'owner')
      .map((user) => user.id)

    if (manageableIds.length === 0) {
      return NextResponse.json({ error: 'No selected users can be changed by your role' }, { status: 403 })
    }

    if (action === 'activate') {
      await prisma.user.updateMany({
        where: { id: { in: manageableIds } },
        data: { status: 'active' },
      })
    } else if (action === 'deactivate' || action === 'ban') {
      await prisma.user.updateMany({
        where: { id: { in: manageableIds } },
        data: { status: 'banned' },
      })
    } else if (action === 'delete') {
      await prisma.user.deleteMany({
        where: { id: { in: manageableIds } },
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Mass action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
