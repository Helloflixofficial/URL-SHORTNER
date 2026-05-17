'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Trash2, Plus, Save } from 'lucide-react'

interface Props { 
  initialData?: any
}

export default function PlanEditor({ initialData }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: initialData?.name || '',
    price: initialData?.price || 0,
    timer: initialData?.timer || 5,
    linksLimit: initialData?.linksLimit || -1,
    direct: initialData?.direct || false,
    disableAds: initialData?.disableAds || false,
    disableCaptcha: initialData?.disableCaptcha || false,
    isDefault: initialData?.isDefault || false,
    features: initialData?.features ? JSON.parse(initialData.features) : ['No ads', 'No captcha']
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  
  const addFeature = () => set('features', [...form.features, ''])
  const removeFeature = (i: number) => set('features', form.features.filter((_: any, idx: number) => idx !== i))
  const updateFeature = (i: number, v: string) => {
    const next = [...form.features]
    next[i] = v
    set('features', next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = initialData ? `/api/admin/plans/${initialData.id}` : '/api/admin/plans'
      const res = await fetch(url, {
        method: initialData ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error()
      toast.success(initialData ? 'Plan updated' : 'Plan created')
      router.push('/admin/plans')
      router.refresh()
    } catch {
      toast.error('Operation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1.5"><Label>Plan Name</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Pro Plan" className="glass h-11 border-border/50" /></div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Price ($ / month)</Label>
                <Input type="number" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} className="glass h-11 border-border/50" /></div>
              <div className="space-y-1.5"><Label>Timer (seconds)</Label>
                <Input type="number" value={form.timer} onChange={e => set('timer', e.target.value)} className="glass h-11 border-border/50" /></div>
            </div>

            <div className="space-y-1.5"><Label>Links Limit (-1 for unlimited)</Label>
              <Input type="number" value={form.linksLimit} onChange={e => set('linksLimit', e.target.value)} className="glass h-11 border-border/50" /></div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5"><Label>Default Plan</Label><p className="text-xs text-muted-foreground">New users get this plan</p></div>
                <Switch checked={form.isDefault} onCheckedChange={v => set('isDefault', v)} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5"><Label>Direct Redirect</Label><p className="text-xs text-muted-foreground">Skip wait page completely</p></div>
                <Switch checked={form.direct} onCheckedChange={v => set('direct', v)} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5"><Label>Disable Ads</Label><p className="text-xs text-muted-foreground">Remove all ads for this plan</p></div>
                <Switch checked={form.disableAds} onCheckedChange={v => set('disableAds', v)} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5"><Label>Disable Captcha</Label><p className="text-xs text-muted-foreground">Skip anti-bot check</p></div>
                <Switch checked={form.disableCaptcha} onCheckedChange={v => set('disableCaptcha', v)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Display Features</Label>
              <Button type="button" onClick={addFeature} variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Plus className="w-3 h-3" /> Add Feature
              </Button>
            </div>
            <div className="space-y-2">
              {form.features.map((f: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <Input value={f} onChange={e => updateFeature(i, e.target.value)} placeholder="Feature text" className="glass h-9 border-border/50" />
                  <Button type="button" onClick={() => removeFeature(i)} variant="ghost" size="icon" className="h-9 w-9 text-destructive shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={loading} className="btn-glow gradient-bg-primary text-primary-foreground min-w-[120px]">
          {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Plan</>}
        </Button>
      </div>
    </form>
  )
}
