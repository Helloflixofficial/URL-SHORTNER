import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen, Calendar, Plus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const metadata = { title: 'Admin — Blog Posts' }

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } })
  return (
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-display">
            <span className="gradient-text">Blog Posts</span>
          </h1>
          <p className="text-muted-foreground mt-1">{posts.length} posts</p>
        </div>
        <Button asChild className="btn-glow gradient-bg-primary text-primary-foreground">
          <Link href="/admin/posts/new">
            <Plus className="w-4 h-4 mr-2" /> Add Post
          </Link>
        </Button>
      </div>
      {posts.length === 0 ? (
        <Card className="glass border-border/50"><CardContent className="py-12 text-center text-muted-foreground"><BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No posts yet</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {posts.map(p => (
            <Card key={p.id} className="glass border-border/50">
              <CardContent className="py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{p.title}</p>
                  <p className="text-xs text-muted-foreground">/{p.slug}</p>
                </div>
                <span className={`text-xs font-semibold ${p.published ? 'text-emerald-400' : 'text-amber-400'}`}>{p.published ? 'Published' : 'Draft'}</span>
                <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
