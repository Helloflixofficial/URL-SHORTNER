'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Save, Settings2, Mail, Users, Wallet, CreditCard, 
  Megaphone, ShieldCheck, Code, Globe, ChevronRight 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props { options: Record<string, string> }

const TABS = [
  { id: 'general', label: 'General', icon: Globe, desc: 'Core site details and behavior' },
  { id: 'email', label: 'Email & SMTP', icon: Mail, desc: 'Mail server configuration' },
  { id: 'social', label: 'Social Login', icon: Users, desc: 'Google and Facebook OAuth' },
  { id: 'payouts', label: 'Payouts', icon: Wallet, desc: 'Withdraw limits and timers' },
  { id: 'methods', label: 'Withdraw Methods', icon: CreditCard, desc: 'Available payment gateways' },
  { id: 'ads', label: 'Ads Integration', icon: Megaphone, desc: 'Banner and popup configs' },
  { id: 'captcha', label: 'Security & CAPTCHA', icon: ShieldCheck, desc: 'reCAPTCHA configuration' },
  { id: 'advanced', label: 'Advanced', icon: Code, desc: 'Custom CSS and JS injection' },
]

export default function AdminSettingsForm({ options }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
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
      toast.success('Settings saved successfully!')
      router.refresh()
    } catch { toast.error('Failed to save settings') }
    finally { setSaving(false) }
  }

  const SaveBtn = ({ keys }: { keys: string[] }) => (
    <Button onClick={() => save(keys)} disabled={saving} className="btn-glow gradient-bg-primary text-primary-foreground min-w-[140px]">
      {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
    </Button>
  )

  const activeTabData = TABS.find(t => t.id === activeTab)

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Mobile: horizontal scrollable tabs */}
      <div className="flex md:hidden overflow-x-auto gap-1 pb-2 -mx-4 px-4 scrollbar-hide">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all',
              activeTab === t.id
                ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                : 'text-muted-foreground bg-muted/30 hover:bg-muted/60'
            )}
          >
            <t.icon className="w-3.5 h-3.5 shrink-0" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Desktop: sidebar + content */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        {/* Sidebar Navigation — desktop only */}
        <div className="hidden md:flex w-52 lg:w-64 shrink-0 flex-col gap-1 sticky top-24">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group',
                activeTab === t.id
                  ? 'bg-primary/10 text-primary font-semibold ring-1 ring-primary/20 shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                activeTab === t.id ? "bg-primary text-primary-foreground shadow-md" : "bg-card border border-border/50 group-hover:border-border"
              )}>
                <t.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{t.label}</p>
              </div>
              {activeTab === t.id && <ChevronRight className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 w-full">
        <Card className="glass border-border/50 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-border/30 bg-muted/10 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center shadow-lg">
                {activeTabData && <activeTabData.icon className="w-5 h-5 text-primary-foreground" />}
              </div>
              <div>
                <CardTitle className="text-xl font-bold">{activeTabData?.label}</CardTitle>
                <CardDescription className="text-sm mt-1">{activeTabData?.desc}</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* General */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Site Name</Label>
                      <Input value={vals.site_name ?? ''} onChange={e => set('site_name', e.target.value)} className="bg-muted/50 focus:bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label>Site Email</Label>
                      <Input value={vals.site_email ?? ''} onChange={e => set('site_email', e.target.value)} className="bg-muted/50 focus:bg-background" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Site Description</Label>
                    <Textarea value={vals.site_description ?? ''} onChange={e => set('site_description', e.target.value)} className="bg-muted/50 focus:bg-background resize-none min-h-[100px]" />
                  </div>
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/30">
                    <div className="space-y-2">
                      <Label>Min Alias Length</Label>
                      <Input type="number" value={vals.alias_min_length ?? '5'} onChange={e => set('alias_min_length', e.target.value)} className="bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Alias Length</Label>
                      <Input type="number" value={vals.alias_max_length ?? '7'} onChange={e => set('alias_max_length', e.target.value)} className="bg-muted/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Disallowed Domains <span className="text-xs text-muted-foreground font-normal">(comma separated)</span></Label>
                    <Textarea value={vals.disallowed_domains ?? ''} onChange={e => set('disallowed_domains', e.target.value)} className="bg-muted/50 resize-none" rows={2} />
                  </div>
                  <div className="space-y-2 pt-4 border-t border-border/30">
                    <Label>Referral Percentage (%)</Label>
                    <Input type="number" value={vals.referral_percentage ?? '20'} onChange={e => set('referral_percentage', e.target.value)} className="bg-muted/50 max-w-[200px]" />
                    <p className="text-xs text-muted-foreground">Percentage of earnings paid to the referrer (lifetime).</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-destructive/20 bg-destructive/5 mt-4">
                    <div>
                      <p className="text-sm font-bold text-destructive">Maintenance Mode</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Redirect all short links directly without ads while enabled.</p>
                    </div>
                    <Switch checked={vals.maintenance_mode === '1'} onCheckedChange={() => toggle('maintenance_mode')} />
                  </div>
                  <div className="pt-6 flex justify-end">
                    <SaveBtn keys={['site_name', 'site_email', 'site_description', 'alias_min_length', 'alias_max_length', 'disallowed_domains', 'maintenance_mode', 'referral_percentage']} />
                  </div>
                </div>
              )}

              {/* Email */}
              {activeTab === 'email' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Mail Driver</Label>
                    <Select value={vals.mail_driver ?? 'smtp'} onValueChange={v => set('mail_driver', v || 'smtp')}>
                      <SelectTrigger className="bg-muted/50 max-w-[300px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smtp">SMTP Server (Recommended)</SelectItem>
                        <SelectItem value="mail">PHP Mail (Fallback)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/30">
                    <div className="space-y-2">
                      <Label>SMTP Host</Label>
                      <Input value={vals.smtp_host ?? ''} onChange={e => set('smtp_host', e.target.value)} className="bg-muted/50" placeholder="smtp.mailgun.org" />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Port</Label>
                      <Input type="number" value={vals.smtp_port ?? '587'} onChange={e => set('smtp_port', e.target.value)} className="bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Username</Label>
                      <Input value={vals.smtp_username ?? ''} onChange={e => set('smtp_username', e.target.value)} className="bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Password</Label>
                      <Input type="password" value={vals.smtp_password ?? ''} onChange={e => set('smtp_password', e.target.value)} className="bg-muted/50" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>SMTP Encryption</Label>
                      <Select value={vals.smtp_encryption ?? 'tls'} onValueChange={v => set('smtp_encryption', v || 'tls')}>
                        <SelectTrigger className="bg-muted/50 max-w-[300px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tls">TLS</SelectItem>
                          <SelectItem value="ssl">SSL</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="pt-6 flex justify-end">
                    <SaveBtn keys={['mail_driver', 'smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'smtp_encryption']} />
                  </div>
                </div>
              )}

              {/* Social Login */}
              {activeTab === 'social' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl border border-border/50 bg-card/40 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5 shadow-sm">
                        <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                      </div>
                      <h3 className="font-bold text-lg">Google Login</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Client ID</Label>
                        <Input value={vals.google_client_id ?? ''} onChange={e => set('google_client_id', e.target.value)} className="bg-muted/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Client Secret</Label>
                        <Input type="password" value={vals.google_client_secret ?? ''} onChange={e => set('google_client_secret', e.target.value)} className="bg-muted/50" />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl border border-border/50 bg-card/40 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center p-1.5 shadow-sm text-white">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </div>
                      <h3 className="font-bold text-lg">Facebook Login</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>App ID</Label>
                        <Input value={vals.facebook_app_id ?? ''} onChange={e => set('facebook_app_id', e.target.value)} className="bg-muted/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>App Secret</Label>
                        <Input type="password" value={vals.facebook_app_secret ?? ''} onChange={e => set('facebook_app_secret', e.target.value)} className="bg-muted/50" />
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 flex justify-end">
                    <SaveBtn keys={['google_client_id', 'google_client_secret', 'facebook_app_id', 'facebook_app_secret']} />
                  </div>
                </div>
              )}

              {/* Withdraw Methods */}
              {activeTab === 'methods' && (
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground mb-6">Select which payment methods users can choose to withdraw their earnings.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {['paypal', 'bitcoin', 'bank_transfer', 'payeer', 'skrill'].map((method) => (
                      <label key={method} className="flex items-start gap-3 p-4 bg-muted/20 hover:bg-muted/40 rounded-xl border border-border/50 cursor-pointer transition-colors">
                        <Switch 
                          checked={vals[`withdraw_method_${method}`] === '1'} 
                          onCheckedChange={(c) => set(`withdraw_method_${method}`, c ? '1' : '0')} 
                        />
                        <div className="space-y-1">
                          <p className="text-sm font-bold capitalize">{method.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground leading-tight">Enable transfers via {method.replace('_', ' ')}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="pt-6 flex justify-end">
                    <SaveBtn keys={['withdraw_method_paypal', 'withdraw_method_bitcoin', 'withdraw_method_bank_transfer', 'withdraw_method_payeer', 'withdraw_method_skrill']} />
                  </div>
                </div>
              )}

              {/* Ads */}
              {activeTab === 'ads' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Default Member Ad Type</Label>
                      <Select value={vals.member_default_advert ?? '1'} onValueChange={v => set('member_default_advert', v || '1')}>
                        <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Interstitial (Full Page)</SelectItem>
                          <SelectItem value="2">Banner (Top/Bottom)</SelectItem>
                          <SelectItem value="3">Random (Mixed)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Earning Mode</Label>
                      <Select value={vals.earning_mode ?? 'simple'} onValueChange={v => set('earning_mode', v || 'simple')}>
                        <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">Simple (Fixed Rates)</SelectItem>
                          <SelectItem value="campaign">Campaign Mode (Dynamic)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-6 pt-6 border-t border-border/30">
                    <h3 className="text-lg font-bold">Ad Code Injection</h3>
                    <div className="space-y-2">
                      <Label>Interstitial Ad URL (Fallback)</Label>
                      <Input value={vals.interstitial_ad_url ?? ''} onChange={e => set('interstitial_ad_url', e.target.value)} placeholder="https://advertiser-site.com" className="bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Interstitial Banner Code</Label>
                      <Textarea value={vals.interstitial_banner_ad ?? ''} onChange={e => set('interstitial_banner_ad', e.target.value)} placeholder="<script>...ad code...</script>" className="bg-muted/50 font-mono text-xs resize-none" rows={4} />
                    </div>
                    <div className="space-y-2">
                      <Label>Banner 728×90 Code (Leaderboard)</Label>
                      <Textarea value={vals.banner_728x90 ?? ''} onChange={e => set('banner_728x90', e.target.value)} placeholder="Leaderboard ad code" className="bg-muted/50 font-mono text-xs resize-none" rows={3} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Banner 468×60 Code</Label>
                        <Textarea value={vals.banner_468x60 ?? ''} onChange={e => set('banner_468x60', e.target.value)} placeholder="Full banner code" className="bg-muted/50 font-mono text-xs resize-none" rows={3} />
                      </div>
                      <div className="space-y-2">
                        <Label>Banner 336×280 Code</Label>
                        <Textarea value={vals.banner_336x280 ?? ''} onChange={e => set('banner_336x280', e.target.value)} placeholder="Large rectangle code" className="bg-muted/50 font-mono text-xs resize-none" rows={3} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5 mt-4">
                    <div>
                      <p className="text-sm font-bold text-primary">Enable Publisher Earnings</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Allow users to earn money when their links are clicked.</p>
                    </div>
                    <Switch checked={vals.enable_publisher_earnings === '1'} onCheckedChange={() => toggle('enable_publisher_earnings')} />
                  </div>
                  <div className="pt-6 flex justify-end">
                    <SaveBtn keys={['member_default_advert', 'earning_mode', 'interstitial_ad_url', 'interstitial_banner_ad', 'banner_728x90', 'banner_468x60', 'banner_336x280', 'enable_publisher_earnings', 'enable_popup', 'popup_ad_url']} />
                  </div>
                </div>
              )}

              {/* Payouts */}
              {activeTab === 'payouts' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Minimum Withdrawal Amount (USD)</Label>
                    <div className="relative max-w-[200px]">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                      <Input type="number" step="0.01" value={vals.min_withdrawal ?? '5.00'} onChange={e => set('min_withdrawal', e.target.value)} className="bg-muted/50 pl-7 font-semibold" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Withdrawal Processing Time</Label>
                    <Input type="text" value={vals.withdraw_processing_time ?? '2-3 business days'} onChange={e => set('withdraw_processing_time', e.target.value)} className="bg-muted/50 max-w-sm" />
                    <p className="text-xs text-muted-foreground mt-1">Displayed to users when requesting a payout.</p>
                  </div>
                  <div className="pt-6 flex justify-end">
                    <SaveBtn keys={['min_withdrawal', 'withdraw_processing_time']} />
                  </div>
                </div>
              )}

              {/* Captcha */}
              {activeTab === 'captcha' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-card/40">
                    <div>
                      <p className="text-sm font-bold">Require CAPTCHA</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Force visitors to solve a CAPTCHA before link redirection.</p>
                    </div>
                    <Switch checked={vals.enable_captcha === 'yes'} onCheckedChange={() => set('enable_captcha', vals.enable_captcha === 'yes' ? 'no' : 'yes')} />
                  </div>
                  
                  <div className={cn("space-y-4 pt-4 border-t border-border/30 transition-opacity", vals.enable_captcha !== 'yes' && "opacity-50 pointer-events-none")}>
                    <div className="space-y-2">
                      <Label>reCAPTCHA Site Key</Label>
                      <Input value={vals.recaptcha_site_key ?? ''} onChange={e => set('recaptcha_site_key', e.target.value)} className="bg-muted/50 font-mono text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label>reCAPTCHA Secret Key</Label>
                      <Input type="password" value={vals.recaptcha_secret_key ?? ''} onChange={e => set('recaptcha_secret_key', e.target.value)} className="bg-muted/50 font-mono text-sm" />
                    </div>
                  </div>
                  <div className="pt-6 flex justify-end">
                    <SaveBtn keys={['enable_captcha', 'recaptcha_site_key', 'recaptcha_secret_key']} />
                  </div>
                </div>
              )}

              {/* Advanced */}
              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Footer Copyright Text</Label>
                    <Input value={vals.footer_text ?? ''} onChange={e => set('footer_text', e.target.value)} className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Custom CSS</Label>
                    <Textarea value={vals.custom_css ?? ''} onChange={e => set('custom_css', e.target.value)} className="bg-muted/50 font-mono text-xs resize-none min-h-[120px]" placeholder="body { ... }" />
                  </div>
                  <div className="space-y-2">
                    <Label>Custom JS (Header)</Label>
                    <Textarea value={vals.custom_js_header ?? ''} onChange={e => set('custom_js_header', e.target.value)} className="bg-muted/50 font-mono text-xs resize-none min-h-[120px]" placeholder="<script>...</script>" />
                  </div>
                  <div className="pt-6 flex justify-end">
                    <SaveBtn keys={['footer_text', 'custom_css', 'custom_js_header']} />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
