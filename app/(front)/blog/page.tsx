import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { BookOpen, ArrowRight } from 'lucide-react'

export const metadata = { title: 'Blog — Linksite' }

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 12,
  })

  return (
    <div className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-6xl font-black mb-4 font-display">
            Latest from our <span className="gradient-text">Blog</span>
          </h1>
          <p className="text-muted-foreground text-lg">Tips, news, and guides to maximize your earnings</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No posts yet</p>
            <p className="text-sm mt-1">Check back soon for tips and guides</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}
                className="glass rounded-2xl border border-border/50 hover:border-primary/30 p-6 transition-all duration-300 group block">
                <div className="mb-3">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <h2 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{post.title}</h2>
                {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>}
                <span className="text-primary text-sm font-medium flex items-center gap-1">
                  Read more <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
