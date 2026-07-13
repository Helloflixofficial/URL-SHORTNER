import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import PostEditor from '@/components/posts/post-editor'

export const metadata = { title: 'Write New Post' }

export default async function MemberNewPostPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const categories = await prisma.postCategory.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="h-[calc(100vh-var(--topbar-height)-2rem)] -mx-6 -mt-2 rounded-xl overflow-hidden border border-border/30">
      <PostEditor
        categories={categories}
        isAdmin={false}
        baseUrl="/posts"
        apiBase="/api/admin/posts"
      />
    </div>
  )
}
