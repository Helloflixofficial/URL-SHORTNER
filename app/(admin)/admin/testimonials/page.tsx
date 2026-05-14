import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'

export const metadata = { title: 'Admin — Testimonials' }

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}><span className="gradient-text">Testimonials</span></h1>
        <p className="text-muted-foreground mt-1">Manage user testimonials on the landing page</p></div>
      {testimonials.length === 0 ? (
        <Card className="glass border-border/50"><CardContent className="py-12 text-center text-muted-foreground"><Star className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No testimonials</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map(t => (
            <Card key={t.id} className="glass border-border/50">
              <CardContent className="pt-5">
                <div className="flex gap-0.5 mb-2">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>
                <p className="text-sm text-muted-foreground mb-3">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <span className={`text-xs font-semibold ${t.published ? 'text-emerald-400' : 'text-amber-400'}`}>{t.published ? 'Published' : 'Hidden'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
