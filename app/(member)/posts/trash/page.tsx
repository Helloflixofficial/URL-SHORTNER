import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import TrashTable from '@/components/posts/trash-table'

export const metadata = { title: 'My Deleted Posts' }

export default async function MemberPostTrashPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  const posts = await prisma.post.findMany({
    where: { status: 'trashed', authorId: userId },
    orderBy: { trashedAt: 'desc' },
    select: {
      id: true, title: true, authorName: true, trashedAt: true, createdAt: true,
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/posts"
          className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display">
            Deleted <span className="gradient-text">Posts</span>
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
        isAdmin={false}
        apiBase="/api/admin/posts"
      />
    </div>
  )
}
