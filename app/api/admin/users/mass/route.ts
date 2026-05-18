import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { action, ids } = await req.json()
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
    }

    if (action === 'activate') {
      await prisma.user.updateMany({
        where: { id: { in: ids } },
        data: { status: 'active' },
      })
    } else if (action === 'deactivate' || action === 'ban') {
      await prisma.user.updateMany({
        where: { id: { in: ids }, role: { not: 'admin' } }, // prevent banning admins
        data: { status: 'banned' },
      })
    } else if (action === 'delete') {
      await prisma.user.deleteMany({
        where: { id: { in: ids }, role: { not: 'admin' } }, // prevent deleting admins
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
