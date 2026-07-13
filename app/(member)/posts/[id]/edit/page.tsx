import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import PostEditor from '@/components/posts/post-editor'

export const metadata = { title: 'Edit Post' }

export default async function MemberEditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { id } = await params
  const userId = session.user.id

  const [post, categories] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    prisma.postCategory.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!post) notFound()

  // Security: Members can only edit their own posts
  if (post.authorId !== userId) {
    redirect('/posts')
  }

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
        }}
        categories={categories}
        isAdmin={false}
        baseUrl="/posts"
        apiBase="/api/admin/posts"
      />
    </div>
  )
}
