import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import SettingsForm from '@/components/member/settings-form'

export const metadata = { title: 'Account Settings' }

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const userId = session.user.id!
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true, avatar: true, disableEarnings: true, firstName: true, lastName: true, address1: true, address2: true, city: true, state: true, zip: true, country: true, withdrawalMethod: true, withdrawalAccount: true },
  })
  if (!user) redirect('/login')
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-display">
          Account <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-muted-foreground mt-1">Manage your profile, billing details, and withdrawal preferences.</p>
      </div>
      <SettingsForm user={user} />
    </div>
  )
}
