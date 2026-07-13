import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, Megaphone } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import AdminAnnouncementForm from '@/components/admin/announcement-form'
import DeleteAnnouncementButton from '@/components/admin/delete-announcement-button'

export const metadata = { title: 'Manage Announcements — Admin' }

export default async function AdminAnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-display">
            Manage <span className="gradient-text">Announcements</span>
          </h1>
          <p className="text-muted-foreground mt-1">Broadcast news to your members</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass border-border/50 lg:col-span-1">
          <CardHeader><CardTitle className="text-lg">Create New</CardTitle></CardHeader>
          <CardContent>
            <AdminAnnouncementForm />
          </CardContent>
        </Card>

        <Card className="glass border-border/50 lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">Recent Announcements</CardTitle></CardHeader>
          <CardContent className="p-0">
            {announcements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No announcements yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {announcements.map((a) => (
                  <div key={a.id} className="p-5 flex items-start gap-4 hover:bg-white/5 transition-colors group">
                    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                      a.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                      a.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                      'bg-primary/10 text-primary'
                    }`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">{a.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{a.content}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
                    </div>
                    {/* Delete button — only visible on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <DeleteAnnouncementButton id={a.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
