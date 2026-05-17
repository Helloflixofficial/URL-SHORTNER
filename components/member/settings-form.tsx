'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Lock, Settings, CreditCard, MapPin } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  user: { 
    id: string; username: string; email: string; avatar: string | null; disableEarnings: boolean;
    firstName?: string | null; lastName?: string | null; address1?: string | null; address2?: string | null;
    city?: string | null; state?: string | null; zip?: string | null; country?: string | null;
    withdrawalMethod?: string | null; withdrawalAccount?: string | null;
  }
}

export default function SettingsForm({ user }: Props) {
  const router = useRouter()
  const [username, setUsername] = useState(user.username)
  const [email, setEmail] = useState(user.email)
  const [disableEarnings, setDisableEarnings] = useState(user.disableEarnings)
  
  // Billing fields
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

  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [saving, setSaving] = useState(false)

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
      toast.success('Profile updated!')
      router.refresh()
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setSaving(false) }
  }

  const changePassword = async () => {
    if (!oldPass || !newPass) { toast.error('Fill both password fields'); return }
    if (newPass.length < 8) { toast.error('New password must be at least 8 characters'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/member/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Password changed!')
      setOldPass(''); setNewPass('')
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <Tabs defaultValue="account" className="space-y-5">
      <TabsList className="glass border border-border/50 p-1">
        <TabsTrigger value="account" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <User className="w-4 h-4" /> Account
        </TabsTrigger>
        <TabsTrigger value="billing" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <CreditCard className="w-4 h-4" /> Billing & Payout
        </TabsTrigger>
      </TabsList>

      <TabsContent value="account" className="space-y-5">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-4 h-4 text-primary" />Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-2xl font-bold gradient-bg-primary text-primary-foreground">
                  {user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user.username}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Username</Label>
                <Input value={username} onChange={e => setUsername(e.target.value)} className="h-10 glass border-border/50" />
              </div>
              <div className="space-y-1.5">
                <Label>Email Address</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-10 glass border-border/50" />
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 glass rounded-xl border border-border/50">
              <Switch checked={disableEarnings} onCheckedChange={setDisableEarnings} />
              <div>
                <p className="text-sm font-medium">Disable Earnings</p>
                <p className="text-xs text-muted-foreground">Your links won&apos;t earn money but visitors skip ads</p>
              </div>
            </div>
            <Button onClick={saveProfile} disabled={saving} className="btn-glow gradient-bg-primary text-primary-foreground">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="w-4 h-4 text-primary" />Security</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Current Password</Label>
              <Input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} className="h-10 glass border-border/50" />
            </div>
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="h-10 glass border-border/50" />
            </div>
            <Button onClick={changePassword} disabled={saving} variant="outline">
              {saving ? 'Updating...' : 'Change Password'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="billing" className="space-y-5">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />Address Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>First Name</Label><Input value={firstName} onChange={e => setFirstName(e.target.value)} className="glass border-border/50" /></div>
              <div className="space-y-1.5"><Label>Last Name</Label><Input value={lastName} onChange={e => setLastName(e.target.value)} className="glass border-border/50" /></div>
            </div>
            <div className="space-y-1.5"><Label>Address Line 1</Label><Input value={address1} onChange={e => setAddress1(e.target.value)} className="glass border-border/50" /></div>
            <div className="space-y-1.5"><Label>Address Line 2 (Optional)</Label><Input value={address2} onChange={e => setAddress2(e.target.value)} className="glass border-border/50" /></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="col-span-2 space-y-1.5"><Label>City</Label><Input value={city} onChange={e => setCity(e.target.value)} className="glass border-border/50" /></div>
              <div className="space-y-1.5"><Label>State / Region</Label><Input value={state} onChange={e => setState(e.target.value)} className="glass border-border/50" /></div>
              <div className="space-y-1.5"><Label>Zip / Postal</Label><Input value={zip} onChange={e => setZip(e.target.value)} className="glass border-border/50" /></div>
            </div>
            <div className="space-y-1.5"><Label>Country</Label><Input value={country} onChange={e => setCountry(e.target.value)} className="glass border-border/50" /></div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" />Withdrawal Method</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Withdrawal Method</Label>
              <Select value={withdrawalMethod} onValueChange={setWithdrawalMethod}>
                <SelectTrigger className="glass border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent className="glass border-border">
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="payeer">Payeer</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency (USDT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Withdrawal Account (Email/Wallet/Details)</Label>
              <Textarea 
                value={withdrawalAccount} 
                onChange={e => setWithdrawalAccount(e.target.value)} 
                className="glass border-border/50 resize-none" 
                rows={3} 
                placeholder="Enter your PayPal email, Bank details, or Wallet address here..."
              />
            </div>
            <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-primary">Note:</strong> Please ensure your payment details are accurate. We are not responsible for funds sent to incorrect accounts. Minimum withdrawal amounts vary by method.
              </p>
            </div>
            <Button onClick={saveProfile} disabled={saving} className="btn-glow gradient-bg-primary text-primary-foreground">
              {saving ? 'Saving...' : 'Update Withdrawal Profile'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

