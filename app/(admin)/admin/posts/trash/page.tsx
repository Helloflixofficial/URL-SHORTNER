import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'
import TrashTable from '@/components/posts/trash-table'

export const metadata = { title: 'Admin — Post Trash' }

export default async function AdminPostTrashPage() {
  const session = await requireAdminSession()
  if (!session) redirect('/login')

  const posts = await prisma.post.findMany({
    where: { status: 'trashed' },
    orderBy: { trashedAt: 'desc' },
    select: {
      id: true, title: true, authorName: true, trashedAt: true, createdAt: true,
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/posts"
          className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display">
            Post <span className="gradient-text">Trash</span>
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {posts.length} deleted post{posts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <TrashTable
        posts={posts.map(p => ({
          ...p,
          trashedAt: p.trashedAt?.toISOString() ?? null,
          createdAt: p.createdAt.toISOString(),
        }))}
        isAdmin={true}
        apiBase="/api/admin/posts"
      />
    </div>
  )
}
