'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Save, Eye } from 'lucide-react'

export default function PostForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) return toast.error('Please fill title and content')

    setLoading(true)
    try {
      const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, excerpt, slug })
      })
      if (!res.ok) throw new Error()
      toast.success('Post created successfully')
      router.push('/admin/posts')
    } catch {
      toast.error('Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          placeholder="5 Ways to Increase Your Link Earnings" 
          className="glass border-border/50 h-11"
        />
      </div>

      <div className="space-y-2">
        <Label>Excerpt (Short Description)</Label>
        <Input 
          value={excerpt} 
          onChange={e => setExcerpt(e.target.value)} 
          placeholder="A brief summary for the blog list page..." 
          className="glass border-border/50 h-11"
        />
      </div>

      <div className="space-y-2">
        <Label>Content (Markdown supported)</Label>
        <Textarea 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          placeholder="Write your article here..." 
          className="glass border-border/50 min-h-[300px] font-mono text-sm"
        />
      </div>

      <div className="flex gap-4">
        <Button 
          type="submit" 
          disabled={loading}
          className="flex-1 btn-glow gradient-bg-primary text-primary-foreground h-11"
        >
          {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Post</>}
        </Button>
        <Button type="button" variant="outline" className="h-11 px-6 border-border/50">
          <Eye className="w-4 h-4 mr-2" /> Preview
        </Button>
      </div>
    </form>
  )
}
