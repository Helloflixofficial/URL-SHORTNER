'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Shield, Plus, ShieldCheck, Mail, User, Lock, Loader2, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function AdminsClient({ admins }: { admins: any[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    avatar: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add admin')
      
      toast.success('Admin added successfully')
      setOpen(false)
      setFormData({ username: '', email: '', password: '', avatar: '' })
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete administrator "${name}"? This cannot be undone.`)) return
    
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete administrator')
      
      toast.success('Administrator deleted successfully')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <Card className="glass overflow-hidden border-border/50">
      <div className="p-4 border-b border-border/50 flex flex-wrap gap-4 items-center justify-between bg-muted/20">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="font-semibold font-display">Administrators ({admins.length})</h2>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" className="btn-glow gradient-bg-primary" />}>
            <Plus className="w-4 h-4 mr-2" />
            Add Admin
          </DialogTrigger>
          <DialogContent className="glass border-border/50 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Administrator</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Name / Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    required
                    placeholder="Admin name"
                    className="pl-9"
                    value={formData.username}
                    onChange={(e) => setFormData(p => ({ ...p, username: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    required
                    type="email"
                    placeholder="admin@example.com"
                    className="pl-9"
                    value={formData.email}
                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    required
                    type="password"
                    placeholder="Min 6 characters"
                    minLength={6}
                    className="pl-9"
                    value={formData.password}
                    onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Profile Picture URL (Optional)</Label>
                <Input 
                  placeholder="https://example.com/avatar.png"
                  value={formData.avatar}
                  onChange={(e) => setFormData(p => ({ ...p, avatar: e.target.value }))}
                />
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full btn-glow gradient-bg-primary" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                  Create Admin
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium text-left">User</th>
              <th className="px-4 py-3 font-medium text-left">Role</th>
              <th className="px-4 py-3 font-medium text-left">Status</th>
              <th className="px-4 py-3 font-medium text-left">Created</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {admins.map(admin => (
              <tr key={admin.id} className="hover:bg-muted/10 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 border border-border/50">
                      <AvatarImage src={admin.avatar || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {admin.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{admin.username}</div>
                      <div className="text-xs text-muted-foreground">{admin.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={admin.role === 'owner' ? 'default' : 'outline'} className={admin.role === 'owner' ? 'gradient-bg-primary' : 'bg-primary/10 text-primary border-primary/20'}>
                    {admin.role.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    {admin.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {format(new Date(admin.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-4 py-3 text-right">
                  {admin.role !== 'owner' ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-2 rounded-md"
                      onClick={() => handleDelete(admin.id, admin.username)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground italic pr-2">System Owner</span>
                  )}
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No administrators found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
