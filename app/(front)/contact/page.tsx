'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Mail, Send, MessageSquare, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { toast.error('Please fill all required fields'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Message sent! We\'ll reply within 24 hours.')
    setForm({ name: '', email: '', subject: '', message: '' })
    setLoading(false)
  }

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-6xl font-black mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Get in <span className="gradient-text">touch</span>
          </h1>
          <p className="text-muted-foreground text-lg">Have a question or need help? We&apos;re here for you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            {[
              { icon: Mail, title: 'Email Us', desc: 'hello@linksite.io', sub: 'Reply within 24 hours' },
              { icon: MessageSquare, title: 'Live Chat', desc: 'Available 24/7', sub: 'Average 5min response' },
              { icon: MapPin, title: 'Based Online', desc: 'Worldwide', sub: 'Serving 120+ countries' },
            ].map(({ icon: Icon, title, desc, sub }) => (
              <div key={title} className="glass rounded-2xl p-5 border border-border/50">
                <div className="feature-icon w-10 h-10 mb-3"><Icon className="w-4 h-4 text-white" /></div>
                <p className="font-semibold text-sm mb-0.5">{title}</p>
                <p className="text-sm text-primary">{desc}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="glass rounded-2xl border border-border/50 p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={update('name')} placeholder="John Doe" className="h-11 glass border-border/50" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" className="h-11 glass border-border/50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Input value={form.subject} onChange={update('subject')} placeholder="How can we help?" className="h-11 glass border-border/50" />
              </div>
              <div className="space-y-1.5">
                <Label>Message *</Label>
                <Textarea value={form.message} onChange={update('message')} placeholder="Tell us more..."
                  className="glass border-border/50 resize-none" rows={5} />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 btn-glow font-semibold" style={{ background: 'var(--gradient-primary)' }}>
                {loading ? 'Sending...' : <span className="flex items-center gap-2"><Send className="w-4 h-4" />Send Message</span>}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
