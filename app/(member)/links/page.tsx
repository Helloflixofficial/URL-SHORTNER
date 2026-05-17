import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import LinksTable from '@/components/member/links-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Link2 } from 'lucide-react'

export const metadata = { title: 'My Links' }

export default async function LinksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const userId = session.user.id!
  const { page: pageParam, q } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1'))
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where = {
    userId,
    status: { not: 3 as const },
    ...(q ? { OR: [{ alias: { contains: q } }, { url: { contains: q } }, { title: { contains: q } }] } : {}),
  }

  const [links, total] = await Promise.all([
    prisma.link.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      select: { id: true, alias: true, url: true, title: true, hits: true, adType: true, status: true, createdAt: true },
    }),
    prisma.link.count({ where }),
  ])

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-display">
            My <span className="gradient-text">Links</span>
          </h1>
          <p className="text-muted-foreground mt-1">{total} link{total !== 1 ? 's' : ''} total</p>
        </div>
        <Button asChild className="btn-glow gradient-bg-primary text-primary-foreground">
          <Link href="/links/new"><Plus className="w-4 h-4 mr-2" />New Link</Link>
        </Button>
      </div>
      <LinksTable links={links} total={total} page={page} pageSize={pageSize} baseUrl={baseUrl} searchQuery={q ?? ''} />
    </div>
  )
}
