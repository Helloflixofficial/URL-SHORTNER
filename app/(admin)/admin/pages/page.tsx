import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export const metadata = { title: 'Admin — Pages' }

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black font-display"><span className="gradient-text">Pages</span></h1>
        <p className="text-muted-foreground mt-1">Manage static pages (About, Terms, etc.)</p></div>
      {pages.length === 0 ? (
        <Card className="glass border-border/50"><CardContent className="py-12 text-center text-muted-foreground"><FileText className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No pages yet</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {pages.map(p => (
            <Card key={p.id} className="glass border-border/50">
              <CardContent className="py-4 flex items-center gap-4">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{p.title}</p>
                  <p className="text-xs text-muted-foreground">/p/{p.slug}</p>
                </div>
                <span className={`text-xs font-semibold ${p.published ? 'text-emerald-400' : 'text-amber-400'}`}>{p.published ? 'Published' : 'Draft'}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
