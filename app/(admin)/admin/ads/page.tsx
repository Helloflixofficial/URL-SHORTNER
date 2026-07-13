import { requireAdminSession } from '@/lib/rbac'
import { redirect } from 'next/navigation'
import { getOptions } from '@/lib/options'
import AdsSettingsForm from '@/components/admin/ads-settings-form'

export const metadata = { title: 'Admin — Ads Settings' }

export default async function AdminAdsSettingsPage() {
  const session = await requireAdminSession()
  if (!session) redirect('/login')

  // Check if role is owner (only owner can modify ads settings)
  if (session.user.role !== 'owner') {
    redirect('/admin')
  }


  const options = await getOptions([
    'ads_blog_interstitial_enabled',
    'ads_blog_interstitial_timer',
    'ads_blog_interstitial_steps',
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-display">
          Link <span className="gradient-text">Ads</span>
        </h1>
        <p className="text-muted-foreground mt-1">Configure link redirection and blog interstitial settings</p>
      </div>
      <AdsSettingsForm options={options} />
    </div>
  )
}
