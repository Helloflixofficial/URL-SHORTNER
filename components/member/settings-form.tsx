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
import { User, Lock, Settings } from 'lucide-react'

interface Props {
  user: { id: string; username: string; email: string; avatar: string | null; disableEarnings: boolean }
}

export default function SettingsForm({ user }: Props) {
  const router = useRouter()
  const [username, setUsername] = useState(user.username)
  const [email, setEmail] = useState(user.email)
  const [disableEarnings, setDisableEarnings] = useState(user.disableEarnings)
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [saving, setSaving] = useState(false)

  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/member/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, disableEarnings }),
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
    <div className="space-y-5">
      <Card className="glass border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-4 h-4 text-primary" />Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-2xl font-bold" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
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
              <Label>Email</Label>
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
          <Button onClick={saveProfile} disabled={saving} className="btn-glow" style={{ background: 'var(--gradient-primary)' }}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="w-4 h-4 text-primary" />Change Password</CardTitle></CardHeader>
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
    </div>
  )
}
