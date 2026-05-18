'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Send, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewTicketPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ subject: '', message: '', priority: '0' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error()
      toast.success('Ticket created successfully!')
      router.push('/tickets')
      router.refresh()
    } catch {
      toast.error('Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="rounded-xl">
          <Link href="/tickets"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-black font-display">New <span className="gradient-text">Ticket</span></h1>
          <p className="text-muted-foreground mt-1">Submit your request and our team will help you.</p>
        </div>
      </div>

      <Card className="glass border-border/50">
        <CardHeader><CardTitle>Ticket Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} 
                required placeholder="e.g. Withdrawal problem" className="glass h-11 border-border/50" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v || '0' })}>
                <SelectTrigger className="glass h-11 border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent className="glass border-border">
                  <SelectItem value="0">Low</SelectItem>
                  <SelectItem value="1">Medium</SelectItem>
                  <SelectItem value="2">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                required placeholder="Describe your issue in detail..." className="glass min-h-[150px] border-border/50 resize-none" />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 btn-glow gradient-bg-primary text-primary-foreground font-semibold">
              {loading ? 'Submitting...' : <><Send className="w-4 h-4 mr-2" /> Submit Ticket</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
