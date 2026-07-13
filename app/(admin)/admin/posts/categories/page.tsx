import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Tag, FolderOpen, ArrowLeft } from 'lucide-react'
import CategoriesManager from '@/components/posts/categories-manager'

export const metadata = { title: 'Admin — Categories & Tags' }

export default async function AdminCategoriesPage() {
  const session = await requireAdminSession()
  if (!session) redirect('/login')

  const [categories, tags] = await Promise.all([
    prisma.postCategory.findMany({ orderBy: { name: 'asc' } }),
    prisma.postTag.findMany({ orderBy: { name: 'asc' } }),
  ])

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
            Categories & <span className="gradient-text">Tags</span>
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Organize your posts with categories and tags</p>
        </div>
      </div>

      <CategoriesManager
        initialCategories={categories.map(c => ({ ...c, postCount: 0 }))}
        initialTags={tags.map(t => ({ ...t, postCount: 0 }))}
      />
    </div>
  )
}
