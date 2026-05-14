'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Save } from 'lucide-react'

interface Props { options: Record<string, string> }

export default function AdminSettingsForm({ options }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [vals, setVals] = useState<Record<string, string>>(options)

  const set = (k: string, v: string) => setVals(p => ({ ...p, [k]: v }))
  const toggle = (k: string) => set(k, vals[k] === '1' ? '0' : '1')

  const save = async (keys: string[]) => {
    setSaving(true)
    try {
      const payload = Object.fromEntries(keys.map(k => [k, vals[k] ?? '']))
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Settings saved!')
      router.refresh()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const SaveBtn = ({ keys }: { keys: string[] }) => (
    <Button onClick={() => save(keys)} disabled={saving} className="btn-glow" style={{ background: 'var(--gradient-primary)' }}>
      {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
    </Button>
  )

  return (
    <Tabs defaultValue="general">
      <TabsList className="glass border border-border/50 p-1 h-auto flex-wrap gap-1">
        {['general', 'ads', 'payouts', 'captcha', 'advanced'].map(t => (
          <TabsTrigger key={t} value={t} className="capitalize text-sm data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
            {t}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* General */}
      <TabsContent value="general">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Site Name</Label>
                <Input value={vals.site_name ?? ''} onChange={e => set('site_name', e.target.value)} className="glass border-border/50" /></div>
              <div className="space-y-1.5"><Label>Site Email</Label>
                <Input value={vals.site_email ?? ''} onChange={e => set('site_email', e.target.value)} className="glass border-border/50" /></div>
            </div>
            <div className="space-y-1.5"><Label>Site Description</Label>
              <Textarea value={vals.site_description ?? ''} onChange={e => set('site_description', e.target.value)} className="glass border-border/50 resize-none" rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Min Alias Length</Label>
                <Input type="number" value={vals.alias_min_length ?? '5'} onChange={e => set('alias_min_length', e.target.value)} className="glass border-border/50" /></div>
              <div className="space-y-1.5"><Label>Max Alias Length</Label>
                <Input type="number" value={vals.alias_max_length ?? '7'} onChange={e => set('alias_max_length', e.target.value)} className="glass border-border/50" /></div>
            </div>
            <div className="space-y-1.5"><Label>Disallowed Domains <span className="text-xs text-muted-foreground">(comma separated)</span></Label>
              <Textarea value={vals.disallowed_domains ?? ''} onChange={e => set('disallowed_domains', e.target.value)} className="glass border-border/50 resize-none" rows={2} /></div>
            <div className="flex items-center gap-3 p-4 glass rounded-xl border border-border/50">
              <Switch checked={vals.maintenance_mode === '1'} onCheckedChange={() => toggle('maintenance_mode')} />
              <div><p className="text-sm font-medium">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">Redirect all short links directly without ads</p></div>
            </div>
            <SaveBtn keys={['site_name', 'site_email', 'site_description', 'alias_min_length', 'alias_max_length', 'disallowed_domains', 'maintenance_mode', 'footer_text']} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Ads */}
      <TabsContent value="ads">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle>Ad Settings</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Default Member Ad Type</Label>
                <Select value={vals.member_default_advert ?? '1'} onValueChange={v => set('member_default_advert', v || '1')}>
                  <SelectTrigger className="glass border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass border-border">
                    <SelectItem value="1">Interstitial</SelectItem>
                    <SelectItem value="2">Banner</SelectItem>
                    <SelectItem value="3">Random</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Earning Mode</Label>
                <Select value={vals.earning_mode ?? 'simple'} onValueChange={v => set('earning_mode', v || 'simple')}>
                  <SelectTrigger className="glass border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass border-border">
                    <SelectItem value="simple">Simple (Fixed Rates)</SelectItem>
                    <SelectItem value="campaign">Campaign Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Interstitial Ad URL</Label>
              <Input value={vals.interstitial_ad_url ?? ''} onChange={e => set('interstitial_ad_url', e.target.value)} placeholder="https://advertiser-site.com" className="glass border-border/50" /></div>
            <div className="space-y-1.5"><Label>Interstitial Banner Ad Code</Label>
              <Textarea value={vals.interstitial_banner_ad ?? ''} onChange={e => set('interstitial_banner_ad', e.target.value)} placeholder="<script>...ad code...</script>" className="glass border-border/50 font-mono text-xs resize-none" rows={4} /></div>
            <div className="space-y-1.5"><Label>Banner 728×90 Code</Label>
              <Textarea value={vals.banner_728x90 ?? ''} onChange={e => set('banner_728x90', e.target.value)} placeholder="Ad code" className="glass border-border/50 font-mono text-xs resize-none" rows={3} /></div>
            <div className="flex items-center gap-3 p-4 glass rounded-xl border border-border/50">
              <Switch checked={vals.enable_publisher_earnings === '1'} onCheckedChange={() => toggle('enable_publisher_earnings')} />
              <div><p className="text-sm font-medium">Enable Publisher Earnings</p>
                <p className="text-xs text-muted-foreground">Toggle whether publishers earn from views</p></div>
            </div>
            <SaveBtn keys={['member_default_advert', 'earning_mode', 'interstitial_ad_url', 'interstitial_banner_ad', 'banner_728x90', 'banner_468x60', 'banner_336x280', 'enable_publisher_earnings', 'enable_popup', 'popup_ad_url']} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Payouts */}
      <TabsContent value="payouts">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle>Payout Rates</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground">Rates are in USD per 1000 views (CPM). Set rates per country code (e.g. US, GB) or &quot;all&quot; for global default. JSON format: <code className="text-xs bg-white/5 px-1 rounded">{`{"all":{"2":0.003,"3":0.002},"US":{"2":0.01}}`}</code></p>
            {[
              { key: 'payout_rates_interstitial', label: 'Interstitial CPM Rates' },
              { key: 'payout_rates_banner', label: 'Banner CPM Rates' },
              { key: 'payout_rates_popup', label: 'Popup CPM Rates' },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <Textarea value={vals[key] ?? ''} onChange={e => set(key, e.target.value)}
                  className="glass border-border/50 font-mono text-xs resize-none" rows={3} />
              </div>
            ))}
            <div className="space-y-1.5"><Label>Minimum Withdrawal (USD)</Label>
              <Input type="number" value={vals.min_withdrawal ?? '5'} onChange={e => set('min_withdrawal', e.target.value)} className="glass border-border/50 max-w-xs" /></div>
            <SaveBtn keys={['payout_rates_interstitial', 'payout_rates_banner', 'payout_rates_popup', 'min_withdrawal']} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Captcha */}
      <TabsContent value="captcha">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle>CAPTCHA Settings</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-3 p-4 glass rounded-xl border border-border/50">
              <Switch checked={vals.enable_captcha === 'yes'} onCheckedChange={() => set('enable_captcha', vals.enable_captcha === 'yes' ? 'no' : 'yes')} />
              <div><p className="text-sm font-medium">Enable CAPTCHA</p>
                <p className="text-xs text-muted-foreground">Require CAPTCHA before redirect</p></div>
            </div>
            <div className="space-y-1.5"><Label>reCAPTCHA Site Key</Label>
              <Input value={vals.recaptcha_site_key ?? ''} onChange={e => set('recaptcha_site_key', e.target.value)} className="glass border-border/50" /></div>
            <div className="space-y-1.5"><Label>reCAPTCHA Secret Key</Label>
              <Input type="password" value={vals.recaptcha_secret_key ?? ''} onChange={e => set('recaptcha_secret_key', e.target.value)} className="glass border-border/50" /></div>
            <SaveBtn keys={['enable_captcha', 'recaptcha_site_key', 'recaptcha_secret_key']} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Advanced */}
      <TabsContent value="advanced">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle>Advanced Settings</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5"><Label>Footer Text</Label>
              <Input value={vals.footer_text ?? ''} onChange={e => set('footer_text', e.target.value)} className="glass border-border/50" /></div>
            <SaveBtn keys={['footer_text']} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
