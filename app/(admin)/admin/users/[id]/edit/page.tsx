import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdminSession } from '@/lib/rbac'
import { canManageTargetRole } from '@/lib/roles'
import type { UserRole, UserStatus } from '@prisma/client'

const roles = ['owner', 'admin', 'member'] as const
const statuses = ['active', 'inactive', 'banned'] as const

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const p = await params
  const user = await prisma.user.findUnique({ where: { id: p.id } })
  return { title: user ? `Edit User: ${user.username}` : 'User Not Found' }
}

export default async function AdminUserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession()
  if (!session) redirect('/dashboard')

  const p = await params
  const user = await prisma.user.findUnique({
    where: { id: p.id },
    include: { userPlan: true }
  })

  if (!user) notFound()
  if (!canManageTargetRole(session.user.role, user.role)) redirect(`/admin/users/${user.id}`)

  const plans = await prisma.plan.findMany()

  async function updateUser(formData: FormData) {
    'use server'
    const session = await requireAdminSession()
    if (!session) throw new Error('Unauthorized')

    const status = formData.get('status') as string
    const role = formData.get('role') as string
    const balance = parseFloat(formData.get('balance') as string)
    const planId = formData.get('planId') as string
    const disableEarnings = formData.get('disableEarnings') === 'on'

    const target = await prisma.user.findUnique({
      where: { id: user!.id },
      select: { id: true, role: true },
    })
    if (!target || !canManageTargetRole(session.user.role, target.role)) {
      throw new Error('Forbidden')
    }
    if (!statuses.includes(status as (typeof statuses)[number])) {
      throw new Error('Invalid status')
    }
    if (!roles.includes(role as (typeof roles)[number])) {
      throw new Error('Invalid role')
    }
    if (role !== target.role && session.user.role !== 'owner') {
      throw new Error('Only the owner can change roles')
    }
    if (target.role === 'owner' && role !== 'owner') {
      const ownerCount = await prisma.user.count({ where: { role: 'owner' } })
      if (ownerCount <= 1) throw new Error('At least one owner is required')
    }

    await prisma.user.update({
      where: { id: user!.id },
      data: {
        status: status as UserStatus,
        role: role as UserRole,
        balance: isNaN(balance) ? undefined : balance,
        disableEarnings,
        // Update basic info
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        country: formData.get('country') as string,
      }
    })

    if (planId) {
      if (user?.userPlan) {
        await prisma.userPlan.update({
          where: { id: user!.userPlan.id },
          data: { planId }
        })
      } else {
        await prisma.userPlan.create({
          data: { userId: user!.id, planId }
        })
      }
    }

    revalidatePath(`/admin/users/${user!.id}`)
    revalidatePath('/admin/users')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="shrink-0 text-muted-foreground">
          <Link href={`/admin/users/${user.id}`}><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-black font-display">
            Edit <span className="gradient-text">{user.username}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Modify user details and account settings</p>
        </div>
      </div>

      <form action={updateUser}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass border-border/50">
            <CardHeader><CardTitle className="text-base">Account Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select name="status" defaultValue={user.status}>
                    <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select name="role" defaultValue={user.role}>
                    <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      {(session.user.role === 'owner' || user.role === 'owner') && (
                        <SelectItem value="owner">Owner</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assigned Plan</Label>
                <Select name="planId" defaultValue={user.userPlan?.planId}>
                  <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Select a plan" /></SelectTrigger>
                  <SelectContent>
                    {plans.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Balance ($)</Label>
                <Input name="balance" type="number" step="0.0001" defaultValue={user.balance} className="bg-muted/50" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
                <div className="space-y-0.5">
                  <Label>Disable Earnings</Label>
                  <p className="text-xs text-muted-foreground">Stop this user from earning via links</p>
                </div>
                <Switch name="disableEarnings" defaultChecked={user.disableEarnings} />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader><CardTitle className="text-base">Profile Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input name="firstName" defaultValue={user.firstName || ''} className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input name="lastName" defaultValue={user.lastName || ''} className="bg-muted/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input name="country" defaultValue={user.country || ''} className="bg-muted/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" className="btn-glow gradient-bg-primary text-primary-foreground">
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
