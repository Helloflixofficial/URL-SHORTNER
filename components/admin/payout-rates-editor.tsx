'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Plus, Save, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Rate { country: string; desktop: number; mobile: number }
interface Props { initialRates: Record<string, any> }

export default function PayoutRatesEditor({ initialRates }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  
  // Transform initialRates into an array
  const transform = (raw: any): Rate[] => {
    return Object.entries(raw).map(([country, val]: [string, any]) => {
      const desktop = val.desktop ?? (val['2'] ? val['2'] * 1000 : 0)
      const mobile = val.mobile ?? (val['3'] ? val['3'] * 1000 : 0)
      return { country, desktop, mobile }
    })
  }

  const [rates, setRates] = useState<Rate[]>(
    transform(initialRates).length > 0 ? transform(initialRates) : [{ country: 'all', desktop: 1, mobile: 1 }]
  )

  const addRate = () => setRates([...rates, { country: '', desktop: 0, mobile: 0 }])
  const removeRate = (index: number) => setRates(rates.filter((_, i) => i !== index))
  const updateRate = (index: number, key: keyof Rate, val: string) => {
    const next = [...rates]
    if (key === 'country') next[index].country = val
    else next[index][key] = parseFloat(val) || 0
    setRates(next)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Transform back to Adlinkfly compatible format { US: { '2': 0.01, '3': 0.012 } }
      const payload: Record<string, any> = {}
      rates.forEach(r => {
        if (!r.country) return
        payload[r.country] = {
          '2': r.desktop / 1000,
          '3': r.mobile / 1000,
          desktop: r.desktop,
          mobile: r.mobile
        }
      })

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payout_rates_interstitial: JSON.stringify(payload) })
      })
      if (!res.ok) throw new Error()
      toast.success('Rates updated successfully')
      router.refresh()
    } catch {
      toast.error('Failed to save rates')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Set rates in USD per 1000 views (CPM). Use &quot;all&quot; for the global default.</p>
        <Button onClick={addRate} variant="outline" size="sm" className="glass border-border/50">
          <Plus className="w-4 h-4 mr-2" /> Add Country
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rates.map((rate, i) => (
          <Card key={i} className="glass border-border/50">
            <CardContent className="py-4 flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[150px] space-y-1.5">
                <Label>Country Code / Name</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={rate.country} 
                    onChange={e => updateRate(i, 'country', e.target.value)} 
                    placeholder="e.g. US or United States" 
                    className="pl-9 glass border-border/50"
                  />
                </div>
              </div>
              <div className="w-32 space-y-1.5">
                <Label>Desktop CPM</Label>
                <Input 
                  type="number" 
                  step="0.1"
                  value={rate.desktop} 
                  onChange={e => updateRate(i, 'desktop', e.target.value)} 
                  className="glass border-border/50"
                />
              </div>
              <div className="w-32 space-y-1.5">
                <Label>Mobile CPM</Label>
                <Input 
                  type="number" 
                  step="0.1"
                  value={rate.mobile} 
                  onChange={e => updateRate(i, 'mobile', e.target.value)} 
                  className="glass border-border/50"
                />
              </div>
              <Button 
                onClick={() => removeRate(i)} 
                variant="ghost" 
                size="icon" 
                className="text-destructive hover:bg-destructive/10"
                disabled={rates.length <= 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-4 border-t border-border/30">
        <Button onClick={handleSave} disabled={saving} className="btn-glow gradient-bg-primary text-primary-foreground">
          {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Payout Rates</>}
        </Button>
      </div>
    </div>
  )
}
