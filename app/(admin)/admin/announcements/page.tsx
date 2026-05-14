import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const metadata = { title: 'Admin — Announcements' }

export default async function AdminAnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}><span className="gradient-text">Announcements</span></h1>
        <p className="text-muted-foreground mt-1">Site-wide notices shown to members</p></div>
      {announcements.length === 0 ? (
        <Card className="glass border-border/50"><CardContent className="py-12 text-center text-muted-foreground"><MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No announcements</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <Card key={a.id} className="glass border-border/50">
              <CardContent className="py-4">
                <p className="font-bold text-sm mb-1">{a.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{a.content}</p>
                <p className="text-xs text-muted-foreground mt-2">{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
