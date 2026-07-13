import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'
import { auth } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const adminSession = await requireAdminSession()
  let memberUserId: string | null = null

  if (!adminSession) {
    const memberSession = await auth()
    if (!memberSession?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    memberUserId = memberSession.user.id
  }

  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (memberUserId && post.authorId !== memberUserId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (post.status !== 'trashed') return NextResponse.json({ error: 'Post is not in trash' }, { status: 400 })

  try {
    const restored = await prisma.post.update({
      where: { id },
      data: { status: 'draft', trashedAt: null },
    })
    return NextResponse.json({ success: true, post: restored })
  } catch (err) {
    console.error('[POST /api/admin/posts/[id]/restore] Error:', err instanceof Error ? err.message : 'Unknown')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
