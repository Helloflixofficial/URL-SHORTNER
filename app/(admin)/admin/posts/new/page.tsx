import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'
import { redirect } from 'next/navigation'
import PostEditor from '@/components/posts/post-editor'

export const metadata = { title: 'Admin — New Post' }

export default async function AdminNewPostPage() {
  const session = await requireAdminSession()
  if (!session) redirect('/login')

  const categories = await prisma.postCategory.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="h-[calc(100vh-var(--topbar-height)-2rem)] -mx-6 -mt-2 rounded-xl overflow-hidden border border-border/30">
      <PostEditor
        categories={categories}
        isAdmin={true}
        baseUrl="/admin/posts"
        apiBase="/api/admin/posts"
      />
    </div>
  )
}
