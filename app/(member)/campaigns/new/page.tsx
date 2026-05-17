'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Megaphone } from 'lucide-react'

export default function NewCampaignPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', websiteUrl: '', adType: '1', budget: '', trafficSource: '1' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.websiteUrl || !form.budget) { toast.error('Fill all required fields'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, adType: parseInt(form.adType), budget: parseFloat(form.budget), trafficSource: parseInt(form.trafficSource) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Campaign submitted for review!')
      router.push('/campaigns')
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-black font-display">
          New <span className="gradient-text">Campaign</span>
        </h1>
        <p className="text-muted-foreground mt-1">Advertise across the Linksite publisher network</p>
      </div>
      <Card className="glass border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="w-5 h-5 text-primary" />Campaign Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5"><Label>Campaign Name *</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="My Product Campaign" className="h-11 glass border-border/50" /></div>
            <div className="space-y-1.5"><Label>Website URL *</Label>
              <Input type="url" value={form.websiteUrl} onChange={e => set('websiteUrl', e.target.value)} placeholder="https://yourwebsite.com" className="h-11 glass border-border/50" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Ad Type</Label>
                <Select value={form.adType} onValueChange={v => set('adType', v || '1')}>
                  <SelectTrigger className="h-11 glass border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass border-border">
                    <SelectItem value="1">Interstitial</SelectItem>
                    <SelectItem value="2">Banner</SelectItem>
                    <SelectItem value="3">Popup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Traffic Source</Label>
                <Select value={form.trafficSource} onValueChange={v => set('trafficSource', v || '1')}>
                  <SelectTrigger className="h-11 glass border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass border-border">
                    <SelectItem value="1">All Traffic</SelectItem>
                    <SelectItem value="2">Desktop Only</SelectItem>
                    <SelectItem value="3">Mobile Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Total Budget (USD) *</Label>
              <Input type="number" min="1" step="0.01" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="100.00" className="h-11 glass border-border/50" /></div>
            <Button type="submit" disabled={loading} className="w-full h-11 btn-glow font-semibold gradient-bg-primary text-primary-foreground">
              {loading ? 'Submitting...' : 'Submit Campaign for Review'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
