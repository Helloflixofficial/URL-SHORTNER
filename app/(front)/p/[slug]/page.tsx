import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await prisma.page.findUnique({ where: { slug } })
  return { title: page?.title ?? 'Page Not Found' }
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await prisma.page.findUnique({ where: { slug, published: true } })
  if (!page) notFound()

  return (
    <div className="py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <Button asChild variant="ghost" className="mb-8 -ml-2 text-muted-foreground">
          <Link href="/"><ArrowLeft className="w-4 h-4 mr-2" />Back to Home</Link>
        </Button>
        <h1 className="text-3xl md:text-5xl font-black mb-8 font-display">
          {page.title}
        </h1>
        <div className="glass rounded-2xl border border-border/50 p-8">
          <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
      </div>
    </div>
  )
}
