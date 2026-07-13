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
  let authorName: string

  if (!adminSession) {
    const memberSession = await auth()
    if (!memberSession?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    memberUserId = memberSession.user.id
    authorName = memberSession.user.name ?? memberSession.user.email ?? 'User'
  } else {
    authorName = adminSession.user.name ?? adminSession.user.email ?? 'Admin'
  }

  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (memberUserId && post.authorId !== memberUserId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    // Generate unique slug for the duplicate
    const baseSlug = `${post.slug}-copy`
    let slug = baseSlug
    let suffix = 1
    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`
    }

    const duplicate = await prisma.post.create({
      data: {
        slug,
        title: `${post.title} (Copy)`,
        content: post.content,
        excerpt: post.excerpt ?? undefined,
        image: post.image ?? undefined,
        status: 'draft',
        authorId: memberUserId ?? adminSession!.user.id!,
        authorName,
        categoryId: post.categoryId ?? undefined,
        tags: post.tags,
        metaTitle: post.metaTitle ?? undefined,
        metaDesc: post.metaDesc ?? undefined,
        focusKw: post.focusKw ?? undefined,
        featured: false,
        allowComments: post.allowComments,
        wordCount: post.wordCount,
        readingTime: post.readingTime,
      },
    })

    return NextResponse.json({ success: true, post: duplicate })
  } catch (err) {
    console.error('[POST /api/admin/posts/[id]/duplicate] Error:', err instanceof Error ? err.message : 'Unknown')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
