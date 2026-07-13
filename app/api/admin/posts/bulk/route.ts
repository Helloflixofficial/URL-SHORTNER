import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'
import { auth } from '@/lib/auth'

// Security: Bulk actions are strictly validated — only allowed actions run.
// Each id is verified for ownership before acting.

export async function POST(req: NextRequest) {
  const adminSession = await requireAdminSession()
  let memberUserId: string | null = null

  if (!adminSession) {
    const memberSession = await auth()
    if (!memberSession?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    memberUserId = memberSession.user.id
  }

  try {
    const body = await req.json()
    const { ids, action } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No post IDs provided' }, { status: 400 })
    }

    const allowedActions = ['publish', 'unpublish', 'trash', 'delete']
    if (!allowedActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Limit bulk operations to 100 posts at once
    const safeIds = ids.slice(0, 100).map(String)

    // For members: only allow operating on their own posts
    const where = memberUserId
      ? { id: { in: safeIds }, authorId: memberUserId }
      : { id: { in: safeIds } }

    if (action === 'delete') {
      // Hard delete only trashed posts
      const trashedWhere = { ...where, status: 'trashed' as const }
      await prisma.post.deleteMany({ where: trashedWhere })
    } else {
      const statusMap: Record<string, string> = {
        publish: 'published',
        unpublish: 'draft',
        trash: 'trashed',
      }
      const newStatus = statusMap[action]
      const data: Record<string, unknown> = { status: newStatus }
      if (newStatus === 'published') data.publishedAt = new Date()
      if (newStatus === 'trashed') data.trashedAt = new Date()

      await prisma.post.updateMany({ where, data })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/admin/posts/bulk] Error:', err instanceof Error ? err.message : 'Unknown')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
