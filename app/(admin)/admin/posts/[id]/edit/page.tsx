import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'
import { redirect, notFound } from 'next/navigation'
import PostEditor from '@/components/posts/post-editor'

export const metadata = { title: 'Admin — Edit Post' }

export default async function AdminEditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireAdminSession()
  if (!session) redirect('/login')

  const { id } = await params

  const [post, categories] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    prisma.postCategory.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!post) notFound()

  return (
    <div className="h-[calc(100vh-var(--topbar-height)-2rem)] -mx-6 -mt-2 rounded-xl overflow-hidden border border-border/30">
      <PostEditor
        postId={post.id}
        initialData={{
          title: post.title,
          content: post.content,
          excerpt: post.excerpt ?? undefined,
          image: post.image ?? undefined,
          status: post.status as 'draft' | 'published' | 'scheduled' | 'trashed',
          categoryId: post.categoryId ?? undefined,
          tags: post.tags,
          metaTitle: post.metaTitle ?? undefined,
          metaDesc: post.metaDesc ?? undefined,
          focusKw: post.focusKw ?? undefined,
          featured: post.featured,
          allowComments: post.allowComments,
          scheduledAt: post.scheduledAt?.toISOString() ?? undefined,
          slug: post.slug,
          customTheme: post.customTheme ?? undefined,
        }}
        categories={categories}
        isAdmin={true}
        baseUrl="/admin/posts"
        apiBase="/api/admin/posts"
      />
    </div>
  )
}
