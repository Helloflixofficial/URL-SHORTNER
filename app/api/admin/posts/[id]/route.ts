import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'
import { auth } from '@/lib/auth'

// Security: ownership is validated server-side on every request.
// Members can only access their own posts.

async function resolveAuthorizedPost(postId: string, req: NextRequest) {
  const adminSession = await requireAdminSession()
  let memberUserId: string | null = null

  if (!adminSession) {
    const memberSession = await auth()
    if (!memberSession?.user?.id) return { error: 'Unauthorized', status: 401 }
    memberUserId = memberSession.user.id
  }

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) return { error: 'Not found', status: 404 }

  // Members may only access their own posts
  if (memberUserId && post.authorId !== memberUserId) {
    return { error: 'Forbidden', status: 403 }
  }

  return { post, isAdmin: !!adminSession }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = await resolveAuthorizedPost(id, req)
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })

  const post = await prisma.post.findUnique({
    where: { id },
    include: { category: true },
  })

  return NextResponse.json({ post })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = await resolveAuthorizedPost(id, req)
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })

  try {
    const body = await req.json()
    const {
      title, content, excerpt, image, status,
      categoryId, tags, metaTitle, metaDesc, focusKw,
      featured, allowComments, scheduledAt, slug, customTheme,
    } = body

    const allowedStatuses = ['draft', 'published', 'scheduled', 'trashed']
    const data: Record<string, unknown> = {}

    if (title !== undefined) data.title = String(title).trim().slice(0, 500)
    if (content !== undefined) {
      data.content = content
      const plainText = String(content).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      const wordCount = plainText.split(' ').filter(Boolean).length
      data.wordCount = wordCount
      data.readingTime = Math.max(1, Math.ceil(wordCount / 200))
    }
    if (excerpt !== undefined) data.excerpt = String(excerpt).slice(0, 500)
    if (image !== undefined) data.image = image ? String(image).slice(0, 1000) : null
    if (status !== undefined && allowedStatuses.includes(status)) {
      data.status = status
      if (status === 'published' && !result.post.publishedAt) {
        data.publishedAt = new Date()
      }
      if (status === 'trashed') {
        data.trashedAt = new Date()
      }
    }
    if (categoryId !== undefined) data.categoryId = categoryId || null
    if (tags !== undefined) data.tags = Array.isArray(tags) ? tags.map(String).slice(0, 20) : []
    if (metaTitle !== undefined) data.metaTitle = String(metaTitle).slice(0, 200)
    if (metaDesc !== undefined) data.metaDesc = String(metaDesc).slice(0, 500)
    if (focusKw !== undefined) data.focusKw = String(focusKw).slice(0, 100)
    if (featured !== undefined) data.featured = Boolean(featured)
    if (allowComments !== undefined) data.allowComments = Boolean(allowComments)
    if (scheduledAt !== undefined) data.scheduledAt = scheduledAt ? new Date(scheduledAt) : null
    if (customTheme !== undefined) data.customTheme = customTheme ? String(customTheme) : null

    // Slug update — ensure uniqueness
    if (slug !== undefined) {
      const newSlug = String(slug).trim().toLowerCase()
        .replace(/[^\w-]/g, '-').replace(/-+/g, '-').slice(0, 100)
      const existing = await prisma.post.findUnique({ where: { slug: newSlug } })
      if (!existing || existing.id === id) {
        data.slug = newSlug
      }
    }

    const updated = await prisma.post.update({ where: { id }, data })
    return NextResponse.json({ success: true, post: updated })
  } catch (err) {
    console.error('[PATCH /api/admin/posts/[id]] Error:', err instanceof Error ? err.message : 'Unknown')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = await resolveAuthorizedPost(id, req)
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })

  const { searchParams } = new URL(req.url)
  const permanent = searchParams.get('permanent') === 'true'

  try {
    if (permanent) {
      // Hard delete — only allowed from trash
      if (result.post.status !== 'trashed') {
        return NextResponse.json({ error: 'Only trashed posts can be permanently deleted' }, { status: 400 })
      }
      await prisma.post.delete({ where: { id } })
    } else {
      // Soft delete — move to trash
      await prisma.post.update({
        where: { id },
        data: { status: 'trashed', trashedAt: new Date() },
      })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/posts/[id]] Error:', err instanceof Error ? err.message : 'Unknown')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
