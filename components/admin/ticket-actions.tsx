'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Send, CheckCircle2 } from 'lucide-react'

export default function AdminTicketActions({ ticketId, currentStatus }: { ticketId: string, currentStatus: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [close, setClose] = useState(false)

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() && !close) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, close })
      })
      if (!res.ok) throw new Error()
      setMessage('')
      toast.success(close ? 'Ticket closed' : 'Reply sent!')
      router.refresh()
    } catch {
      toast.error('Failed to process action')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleReply} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs uppercase font-bold text-muted-foreground">Admin Response</Label>
        <Textarea 
          value={message} 
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your response to the user..." 
          className="glass min-h-[120px] border-border/50 resize-none" 
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch checked={close} onCheckedChange={setClose} id="close-ticket" />
          <Label htmlFor="close-ticket" className="text-sm cursor-pointer">Close ticket after reply</Label>
        </div>
        
        <div className="flex gap-2">
          {currentStatus !== 2 && !message.trim() && (
            <Button type="button" variant="outline" onClick={() => setClose(true)} disabled={loading} size="sm" className="h-10">
              Just Close
            </Button>
          )}
          <Button type="submit" disabled={loading || (!message.trim() && !close)} className="h-10 btn-glow gradient-bg-primary text-primary-foreground min-w-[120px]">
            {loading ? 'Processing...' : (
              <span className="flex items-center gap-2">
                {close ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                {close ? 'Resolve Ticket' : 'Send Reply'}
              </span>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
