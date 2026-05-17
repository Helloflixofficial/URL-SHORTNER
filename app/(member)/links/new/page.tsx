'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Link2, Zap, Copy, Check, ExternalLink } from 'lucide-react'

const schema = z.object({
  url: z.string().url('Please enter a valid URL'),
  alias: z.string().max(30).regex(/^[0-9a-zA-Z_-]*$/, 'Letters, numbers, dash, underscore only').optional().or(z.literal('')),
  title: z.string().max(200).optional(),
  adType: z.string(),
})
type FormData = z.infer<typeof schema>

const adTypes = [
  { value: '1', label: '⚡ Interstitial (Best CPM)' },
  { value: '2', label: '📢 Banner Ad' },
  { value: '3', label: '🎲 Random' },
  { value: '0', label: '🔗 Direct (No Ads)' },
]

interface Result { shortUrl: string; alias: string }

export default function NewLinkPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [copied, setCopied] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { adType: '1' },
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: data.url, alias: data.alias || undefined, title: data.title || undefined, adType: parseInt(data.adType) }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setResult(json)
      toast.success('Link created!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create link')
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    if (!result) return
    navigator.clipboard.writeText(result.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied!')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-black font-display">
          Create <span className="gradient-text">New Link</span>
        </h1>
        <p className="text-muted-foreground mt-1">Shorten a URL and earn from every click</p>
      </div>
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="w-5 h-5 text-primary" /> Link Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="url">Destination URL *</Label>
              <Input id="url" type="url" placeholder="https://example.com/long-url"
                className="h-11 glass border-border/50" {...register('url')} />
              {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alias">Custom Alias <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <div className="flex gap-2">
                <div className="h-11 px-3 flex items-center glass border border-border/50 rounded-lg text-sm text-muted-foreground shrink-0">
                  linksite.io/
                </div>
                <Input id="alias" placeholder="my-link" className="flex-1 h-11 glass border-border/50" {...register('alias')} />
              </div>
              {errors.alias && <p className="text-xs text-destructive">{errors.alias.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="title">Title <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input id="title" placeholder="My awesome link" className="h-11 glass border-border/50" {...register('title')} />
            </div>
            <div className="space-y-1.5">
              <Label>Ad Type</Label>
              <Select value={watch('adType')} onValueChange={(v) => setValue('adType', v || '1')}>
                <SelectTrigger className="h-11 glass border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent className="glass border-border">
                  {adTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 btn-glow font-semibold gradient-bg-primary text-primary-foreground">
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</span>
                : <span className="flex items-center gap-2"><Zap className="w-4 h-4" />Create Link</span>}
            </Button>
          </form>
          {result && (
            <div className="mt-6 p-4 glass border border-emerald-500/30 rounded-xl">
              <p className="text-xs text-muted-foreground mb-2">Your short link:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-primary truncate">{result.shortUrl}</code>
                <Button size="sm" variant="outline" onClick={copy}>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={result.shortUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5" /></a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
