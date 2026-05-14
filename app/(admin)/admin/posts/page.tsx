import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const metadata = { title: 'Admin — Blog Posts' }

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}><span className="gradient-text">Blog Posts</span></h1>
        <p className="text-muted-foreground mt-1">{posts.length} posts</p></div>
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
