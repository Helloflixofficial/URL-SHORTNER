'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Send } from 'lucide-react'

export default function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })
      if (!res.ok) throw new Error()
      setMessage('')
      toast.success('Reply sent!')
      router.refresh()
    } catch {
      toast.error('Failed to send reply')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <Textarea 
        value={message} 
        onChange={e => setMessage(e.target.value)}
        placeholder="Type your reply here..." 
        className="glass min-h-[44px] h-[44px] py-3 border-border/50 resize-none flex-1" 
      />
      <Button type="submit" disabled={loading || !message.trim()} className="h-11 w-11 shrink-0 rounded-xl gradient-bg-primary text-primary-foreground btn-glow" size="icon">
        {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
      </Button>
    </form>
  )
}
