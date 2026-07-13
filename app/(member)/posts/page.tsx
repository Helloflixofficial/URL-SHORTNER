import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trash2, FolderOpen } from 'lucide-react'
import PostsTable from '@/components/posts/posts-table'

export const metadata = { title: 'My Posts' }

export default async function MemberPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))
  const limit = 20
  const userId = session.user.id

  const where: Record<string, unknown> = {
    authorId: userId,
    status: { not: 'trashed' },
  }
  if (sp.status && ['draft', 'published', 'scheduled'].includes(sp.status)) {
    where.status = sp.status
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: where as Prisma.PostWhereInput,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, slug: true, title: true, excerpt: true, image: true,
        status: true, authorName: true, authorId: true, views: true,
        wordCount: true, readingTime: true, featured: true, tags: true,
        publishedAt: true, scheduledAt: true, trashedAt: true,
        createdAt: true, updatedAt: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.post.count({ where: where as Prisma.PostWhereInput }),
  ])

  const [draftCount, publishedCount, scheduledCount, trashedCount] = await Promise.all([
    prisma.post.count({ where: { authorId: userId, status: 'draft' } }),
    prisma.post.count({ where: { authorId: userId, status: 'published' } }),
    prisma.post.count({ where: { authorId: userId, status: 'scheduled' } }),
    prisma.post.count({ where: { authorId: userId, status: 'trashed' } }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display">
            My <span className="gradient-text">Posts</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Write and manage your blog posts</p>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <Link
            href="/posts/trash"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-border/50 glass text-muted-foreground hover:text-foreground transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Trash
            {trashedCount > 0 && (
              <span className="ml-1 text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-bold">
                {trashedCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Status pills */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'All', count: draftCount + publishedCount + scheduledCount, href: '/posts' },
          { label: 'Published', count: publishedCount, href: '/posts?status=published', color: 'text-emerald-400' },
          { label: 'Draft', count: draftCount, href: '/posts?status=draft', color: 'text-muted-foreground' },
          { label: 'Scheduled', count: scheduledCount, href: '/posts?status=scheduled', color: 'text-blue-400' },
        ].map(s => (
          <Link
            key={s.label}
            href={s.href}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-border/30 text-sm hover:border-primary/40 transition-colors"
          >
            <span className={s.color ?? 'text-foreground'}>{s.label}</span>
            <span className="text-xs text-muted-foreground">({s.count})</span>
          </Link>
        ))}
      </div>

      <PostsTable
        posts={posts.map(p => ({
          ...p,
          publishedAt: p.publishedAt?.toISOString() ?? null,
          scheduledAt: p.scheduledAt?.toISOString() ?? null,
          trashedAt: p.trashedAt?.toISOString() ?? null,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        }))}
        total={total}
        page={page}
        limit={limit}
        isAdmin={false}
        baseUrl="/posts"
        apiBase="/api/admin/posts"
      />
    </div>
  )
}
