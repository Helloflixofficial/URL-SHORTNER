'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Lock, CreditCard, MapPin, Save, ShieldAlert, ChevronRight } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface Props {
  user: { 
    id: string; username: string; email: string; avatar: string | null; disableEarnings: boolean;
    firstName?: string | null; lastName?: string | null; address1?: string | null; address2?: string | null;
    city?: string | null; state?: string | null; zip?: string | null; country?: string | null;
    withdrawalMethod?: string | null; withdrawalAccount?: string | null;
  }
}

const TABS = [
  { id: 'profile', label: 'Profile Information', icon: User, desc: 'Update username and contact info' },
  { id: 'payout', label: 'Withdrawal Settings', icon: CreditCard, desc: 'Manage payment method and accounts' },
  { id: 'billing', label: 'Billing Address', icon: MapPin, desc: 'Your personal billing and location info' },
  { id: 'security', label: 'Security', icon: Lock, desc: 'Change password and secure account' },
]

export default function SettingsForm({ user }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)

  // Profile Form States
  const [username, setUsername] = useState(user.username)
  const [email, setEmail] = useState(user.email)
  const [disableEarnings, setDisableEarnings] = useState(user.disableEarnings)
  
  // Billing Form States
  const [firstName, setFirstName] = useState(user.firstName || '')
  const [lastName, setLastName] = useState(user.lastName || '')
  const [address1, setAddress1] = useState(user.address1 || '')
  const [address2, setAddress2] = useState(user.address2 || '')
  const [city, setCity] = useState(user.city || '')
  const [state, setState] = useState(user.state || '')
  const [zip, setZip] = useState(user.zip || '')
  const [country, setCountry] = useState(user.country || '')
  const [withdrawalMethod, setWithdrawalMethod] = useState(user.withdrawalMethod || 'paypal')
  const [withdrawalAccount, setWithdrawalAccount] = useState(user.withdrawalAccount || '')

  // Password Form States
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')

  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/member/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, email, disableEarnings,
          firstName, lastName, address1, address2,
          city, state, zip, country,
          withdrawalMethod, withdrawalAccount
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Settings updated successfully!')
      router.refresh()
    } catch (e: unknown) { 
      toast.error(e instanceof Error ? e.message : 'Failed to save settings') 
    } finally { 
      setSaving(false) 
    }
  }

  const changePassword = async () => {
    if (!oldPass || !newPass) { 
      toast.error('Please enter both current and new passwords')
      return 
    }
    if (newPass.length < 8) { 
      toast.error('New password must be at least 8 characters')
      return 
    }
    setSaving(true)
    try {
      const res = await fetch('/api/member/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Password changed successfully!')
      setOldPass('')
      setNewPass('')
    } catch (e: unknown) { 
      toast.error(e instanceof Error ? e.message : 'Failed to change password') 
    } finally { 
      setSaving(false) 
    }
  }

  const activeTabData = TABS.find(t => t.id === activeTab)

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {/* Mobile: horizontal scrollable tabs */}
      <div className="flex lg:hidden overflow-x-auto gap-1 pb-1 -mx-4 px-4 scrollbar-hide">
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
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Settings Navigation Sidebar — desktop only */}
        <div className="hidden lg:flex w-64 shrink-0 flex-col gap-1 sticky top-24">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left group',
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
                <p className="text-sm font-semibold">{t.label}</p>
              </div>
              {activeTab === t.id && <ChevronRight className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>

        {/* Settings Sections Container */}
        <div className="flex-1 min-w-0 w-full max-w-4xl">
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
          
          <CardContent className="p-6 md:p-8">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Avatar Display */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-5 rounded-2xl border border-border/30 bg-muted/20">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur group-hover:blur-md transition-all" />
                      <Avatar className="w-16 h-16 border-2 border-primary/20 relative">
                        <AvatarImage src={user.avatar ?? ''} />
                        <AvatarFallback className="text-2xl font-black gradient-bg-primary text-primary-foreground uppercase">
                          {user.username[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="font-bold text-lg">{user.username}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                      <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                        Active Publisher Account
                      </span>
                    </div>
                  </div>

                  {/* Core Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="username" className="font-semibold">Username</Label>
                      <Input 
                        id="username"
                        value={username} 
                        onChange={e => setUsername(e.target.value)} 
                        className="h-11 glass border-border/50 bg-muted/20 focus:bg-background"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="font-semibold">Email Address</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className="h-11 glass border-border/50 bg-muted/20 focus:bg-background"
                      />
                    </div>
                  </div>

                  {/* Settings Toggles */}
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
                    <div className="flex items-start gap-4">
                      <Switch 
                        id="disable-earnings"
                        checked={disableEarnings} 
                        onCheckedChange={setDisableEarnings}
                        className="mt-1"
                      />
                      <div className="space-y-0.5">
                        <Label htmlFor="disable-earnings" className="font-bold text-sm text-primary">Disable Account Earnings</Label>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Enabling this skips intermediate ads for all your visitors. You will not earn money from these visits, but your traffic enjoys a direct, frictionless routing experience.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-border/30 flex justify-end">
                    <Button 
                      onClick={saveProfile} 
                      disabled={saving} 
                      className="btn-glow gradient-bg-primary text-primary-foreground min-w-[140px]"
                    >
                      {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" />Save Profile</>}
                    </Button>
                  </div>
                </div>
              )}

              {/* PAYOUT TAB */}
              {activeTab === 'payout' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-1.5">
                      <Label className="font-semibold">Withdrawal Method</Label>
                      <Select 
                        value={withdrawalMethod} 
                        onValueChange={v => setWithdrawalMethod(v || 'paypal')}
                      >
                        <SelectTrigger className="glass h-11 border-border/50 bg-muted/20">
                          <SelectValue placeholder="Select payout gateway" />
                        </SelectTrigger>
                        <SelectContent className="glass border-border">
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="payeer">Payeer</SelectItem>
                          <SelectItem value="bank">Direct Bank Wire</SelectItem>
                          <SelectItem value="crypto">Tether USDT (TRC-20)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="withdrawal-account" className="font-semibold">Withdrawal Account Details</Label>
                      <Textarea 
                        id="withdrawal-account"
                        value={withdrawalAccount} 
                        onChange={e => setWithdrawalAccount(e.target.value)} 
                        rows={4}
                        placeholder="For PayPal: Enter email address&#10;For Bank Wire: Enter Routing, IBAN, and Beneficiary&#10;For Tether: Enter your TRC-20 address"
                        className="glass border-border/50 bg-muted/20 resize-none font-mono text-xs focus:bg-background"
                      />
                    </div>
                  </div>

                  {/* Safety Warning */}
                  <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 flex gap-3.5">
                    <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-destructive">Payout Account Verification</p>
                      <p className="text-muted-foreground leading-relaxed">
                        Please review your account inputs. NovaCRM is not responsible for transfers completed to wrong addresses or typoed accounts. Modifications here will apply to your subsequent payout cycles.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-border/30 flex justify-end">
                    <Button 
                      onClick={saveProfile} 
                      disabled={saving} 
                      className="btn-glow gradient-bg-primary text-primary-foreground min-w-[140px]"
                    >
                      {saving ? 'Updating...' : <><Save className="w-4 h-4 mr-2" />Save Payout Settings</>}
                    </Button>
                  </div>
                </div>
              )}

              {/* BILLING TAB */}
              {activeTab === 'billing' && (
                <div className="space-y-6">
                  {/* Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="first-name" className="font-semibold">First Name</Label>
                      <Input 
                        id="first-name"
                        value={firstName} 
                        onChange={e => setFirstName(e.target.value)} 
                        className="h-11 glass border-border/50 bg-muted/20" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="last-name" className="font-semibold">Last Name</Label>
                      <Input 
                        id="last-name"
                        value={lastName} 
                        onChange={e => setLastName(e.target.value)} 
                        className="h-11 glass border-border/50 bg-muted/20" 
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label htmlFor="address-1" className="font-semibold">Address Line 1</Label>
                      <Input 
                        id="address-1"
                        value={address1} 
                        onChange={e => setAddress1(e.target.value)} 
                        className="h-11 glass border-border/50 bg-muted/20" 
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label htmlFor="address-2" className="font-semibold">Address Line 2 <span className="text-xs text-muted-foreground font-normal">(Optional)</span></Label>
                      <Input 
                        id="address-2"
                        value={address2} 
                        onChange={e => setAddress2(e.target.value)} 
                        className="h-11 glass border-border/50 bg-muted/20" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="font-semibold">City</Label>
                      <Input 
                        id="city"
                        value={city} 
                        onChange={e => setCity(e.target.value)} 
                        className="h-11 glass border-border/50 bg-muted/20" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="state" className="font-semibold">State / Region</Label>
                      <Input 
                        id="state"
                        value={state} 
                        onChange={e => setState(e.target.value)} 
                        className="h-11 glass border-border/50 bg-muted/20" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="zip" className="font-semibold">Zip / Postal Code</Label>
                      <Input 
                        id="zip"
                        value={zip} 
                        onChange={e => setZip(e.target.value)} 
                        className="h-11 glass border-border/50 bg-muted/20" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="country" className="font-semibold">Country</Label>
                      <Input 
                        id="country"
                        value={country} 
                        onChange={e => setCountry(e.target.value)} 
                        className="h-11 glass border-border/50 bg-muted/20" 
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-border/30 flex justify-end">
                    <Button 
                      onClick={saveProfile} 
                      disabled={saving} 
                      className="btn-glow gradient-bg-primary text-primary-foreground min-w-[140px]"
                    >
                      {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" />Save Billing Profile</>}
                    </Button>
                  </div>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-5 max-w-xl">
                    <div className="space-y-1.5">
                      <Label htmlFor="old-pass" className="font-semibold">Current Password</Label>
                      <Input 
                        id="old-pass"
                        type="password" 
                        value={oldPass} 
                        onChange={e => setOldPass(e.target.value)} 
                        className="h-11 glass border-border/50 bg-muted/20 focus:bg-background" 
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="new-pass" className="font-semibold">New Password</Label>
                      <Input 
                        id="new-pass"
                        type="password" 
                        value={newPass} 
                        onChange={e => setNewPass(e.target.value)} 
                        className="h-11 glass border-border/50 bg-muted/20 focus:bg-background" 
                      />
                      <p className="text-[10px] text-muted-foreground">Password must contain at least 8 characters.</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-border/30 flex justify-end">
                    <Button 
                      onClick={changePassword} 
                      disabled={saving} 
                      className="btn-glow gradient-bg-primary text-primary-foreground min-w-[140px]"
                    >
                      {saving ? 'Updating...' : <><Save className="w-4 h-4 mr-2" />Change Password</>}
                    </Button>
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
