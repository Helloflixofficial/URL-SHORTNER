import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ArrowLeft, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await prisma.post.findUnique({ where: { slug } })
  return { title: post?.title ?? 'Post Not Found' }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await prisma.post.findUnique({ where: { slug, published: true } })
  if (!post) notFound()

  return (
    <div className="py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <Button asChild variant="ghost" className="mb-8 -ml-2 text-muted-foreground">
          <Link href="/blog"><ArrowLeft className="w-4 h-4 mr-2" />Back to Blog</Link>
        </Button>
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black mb-8 font-display">
          {post.title}
        </h1>
        <div className="glass rounded-2xl border border-border/50 p-8">
          <div className="prose prose-invert max-w-none prose-headings:font-bold prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </div>
    </div>
  )
}
