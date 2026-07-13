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

  try {
    const isPublished = post.status === 'published'
    const updateData: Record<string, unknown> = {
      status: isPublished ? 'draft' : 'published',
      publishedAt: isPublished ? post.publishedAt : new Date(),
    }

    // Auto-fix empty slug from title when publishing
    if (!isPublished && (!post.slug || post.slug.trim() === '')) {
      const baseSlug = post.title.trim().toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 100)
      let slug = baseSlug
      let suffix = 1
      while (await prisma.post.findFirst({ where: { slug, NOT: { id: post.id } } })) {
        slug = `${baseSlug}-${suffix++}`
      }
      updateData.slug = slug
    }

    const updated = await prisma.post.update({ where: { id }, data: updateData })
    return NextResponse.json({ success: true, status: updated.status })
  } catch (err) {
    console.error('[POST /api/admin/posts/[id]/publish] Error:', err instanceof Error ? err.message : 'Unknown')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
