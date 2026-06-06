import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'

export async function POST(req: NextRequest) {
  if (!(await requireAdminSession()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { action, ids } = await req.json()
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
    }

    if (action === 'delete') {
      await prisma.link.deleteMany({
        where: { id: { in: ids } },
      })
    } else if (action === 'hide') {
      await prisma.link.updateMany({
        where: { id: { in: ids } },
        data: { status: 3 }, // 3 is usually hidden/deleted softly or 2 is hidden
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
