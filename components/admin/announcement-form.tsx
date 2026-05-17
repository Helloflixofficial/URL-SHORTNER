'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'

export default function AdminAnnouncementForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState('info')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) return toast.error('Please fill all fields')

    setLoading(true)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, type })
      })
      if (!res.ok) throw new Error()
      toast.success('Announcement published!')
      setTitle('')
      setContent('')
      router.refresh()
    } catch {
      toast.error('Failed to publish')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          placeholder="New Update Available" 
          className="glass border-border/50"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="glass border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass border-border/50">
            <SelectItem value="info">Information (Blue)</SelectItem>
            <SelectItem value="success">Success (Green)</SelectItem>
            <SelectItem value="warning">Warning (Amber)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Content</Label>
        <Textarea 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          placeholder="Share your news here..." 
          className="glass border-border/50 min-h-[100px]"
        />
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full btn-glow gradient-bg-primary text-primary-foreground"
      >
        {loading ? 'Publishing...' : <><Send className="w-4 h-4 mr-2" /> Publish Now</>}
      </Button>
    </form>
  )
}
