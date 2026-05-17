'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Zap, Link2, Copy, Check } from 'lucide-react'

interface ShortenResult {
  shortUrl: string
  alias: string
}

export default function ShortenForm() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ShortenResult | null>(null)
  const [copied, setCopied] = useState(false)

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to shorten')
      setResult(data)
      toast.success('Link shortened successfully!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result.shortUrl)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleShorten} className="flex gap-2">
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste your long URL here..."
          aria-label="URL to shorten"
          className="flex-1 h-14 text-base bg-muted border-border/50 placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-ring rounded-xl px-5"
          required
        />
        <Button
          type="submit"
          disabled={loading}
          className="h-14 px-8 rounded-xl btn-glow font-semibold text-base whitespace-nowrap gradient-bg-primary text-primary-foreground"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Shortening...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" /> Shorten
            </span>
          )}
        </Button>
      </form>

      {result && (
        <div className="mt-4 glass border border-primary/30 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-bottom-2">
          <Link2 className="w-5 h-5 text-primary shrink-0" />
          <span className="flex-1 text-primary font-medium truncate">{result.shortUrl}</span>
          <Button size="sm" variant="outline" onClick={handleCopy} className="shrink-0 gap-1.5" aria-label="Copy short URL">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      )}
    </div>
  )
}
