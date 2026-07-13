import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { requireAdminSession } from '@/lib/rbac'
import { auth } from '@/lib/auth'

// Security: All routes validate session server-side before any DB access.
// Prisma ORM is used exclusively — no raw SQL string concatenation.
// Input is validated/trimmed before use.

export async function GET(req: NextRequest) {
  const session = await requireAdminSession()
  const isAdmin = !!session

  // Members can access their own posts only
  let memberUserId: string | null = null
  if (!isAdmin) {
    const memberSession = await auth()
    if (!memberSession?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    memberUserId = memberSession.user.id
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
  const search = (searchParams.get('search') ?? '').trim().slice(0, 200)
  const status = searchParams.get('status') ?? ''
  const categoryId = searchParams.get('categoryId') ?? ''
  const authorId = searchParams.get('authorId') ?? ''
  const sortBy = searchParams.get('sortBy') ?? 'createdAt'
  const sortDir = searchParams.get('sortDir') === 'asc' ? 'asc' : 'desc'

  const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'views', 'status']
  const resolvedSort = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'

  const allowedStatuses = ['draft', 'published', 'scheduled', 'trashed']

  const where: Record<string, unknown> = {}

  // Members can only see their own posts
  if (memberUserId) {
    where.authorId = memberUserId
  } else if (authorId) {
    where.authorId = authorId
  }

  if (status && allowedStatuses.includes(status)) {
    where.status = status
  }
  if (categoryId) {
    where.categoryId = categoryId
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [total, posts] = await Promise.all([
    prisma.post.count({ where: where as Prisma.PostWhereInput }),
    prisma.post.findMany({
      where: where as Prisma.PostWhereInput,
      orderBy: { [resolvedSort]: sortDir } as Prisma.PostOrderByWithRelationInput,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        image: true,
        status: true,
        authorName: true,
        authorId: true,
        views: true,
        wordCount: true,
        readingTime: true,
        featured: true,
        tags: true,
        publishedAt: true,
        scheduledAt: true,
        trashedAt: true,
        createdAt: true,
        updatedAt: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    }),
  ])

  return NextResponse.json({ posts, total, page, limit })
}

export async function POST(req: NextRequest) {
  // Determine caller: admin or member
  const adminSession = await requireAdminSession()
  let authorId: string
  let authorName: string

  if (adminSession) {
    authorId = adminSession.user.id!
    authorName = adminSession.user.name ?? adminSession.user.email ?? 'Admin'
  } else {
    const memberSession = await auth()
    if (!memberSession?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    authorId = memberSession.user.id
    authorName = memberSession.user.name ?? memberSession.user.email ?? 'User'
  }

  try {
    const body = await req.json()
    const {
      title, content = '', excerpt, image, status = 'draft',
      categoryId, tags = [], metaTitle, metaDesc, focusKw,
      featured = false, allowComments = true, scheduledAt,
      customTheme,
    } = body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Auto-generate slug from title
    const baseSlug = title.trim().toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 100)

    let slug = baseSlug
    let suffix = 1
    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`
    }

    // Calculate word count and reading time from plain text content
    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const wordCount = plainText.split(' ').filter(Boolean).length
    const readingTime = Math.max(1, Math.ceil(wordCount / 200))

    const allowedStatuses = ['draft', 'published', 'scheduled', 'trashed']
    const resolvedStatus = allowedStatuses.includes(status) ? status : 'draft'

    const post = await prisma.post.create({
      data: {
        slug,
        title: title.trim().slice(0, 500),
        content,
        excerpt: excerpt ? String(excerpt).slice(0, 500) : undefined,
        image: image ? String(image).slice(0, 1000) : undefined,
        status: resolvedStatus as 'draft' | 'published' | 'scheduled' | 'trashed',
        authorId,
        authorName,
        categoryId: categoryId || undefined,
        tags: Array.isArray(tags) ? tags.map(String).slice(0, 20) : [],
        metaTitle: metaTitle ? String(metaTitle).slice(0, 200) : undefined,
        metaDesc: metaDesc ? String(metaDesc).slice(0, 500) : undefined,
        focusKw: focusKw ? String(focusKw).slice(0, 100) : undefined,
        featured: Boolean(featured),
        allowComments: Boolean(allowComments),
        wordCount,
        readingTime,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        publishedAt: resolvedStatus === 'published' ? new Date() : undefined,
        customTheme: customTheme ? String(customTheme) : undefined,
      },
    })

    return NextResponse.json({ success: true, post })
  } catch (err) {
    // Security: Log internally, return generic error to client
    console.error('[POST /api/admin/posts] Error:', err instanceof Error ? err.message : 'Unknown')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
