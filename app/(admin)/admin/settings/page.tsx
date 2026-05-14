import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminSettingsForm from '@/components/admin/settings-form'
import { getOptions } from '@/lib/options'

export const metadata = { title: 'Admin — Settings' }

export default async function AdminSettingsPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') redirect('/dashboard')

  const keys = [
    'site_name', 'site_description', 'site_email', 'earning_mode',
    'enable_publisher_earnings', 'member_default_advert', 'anonymous_default_advert',
    'min_withdrawal', 'alias_min_length', 'alias_max_length',
    'interstitial_ad_url', 'interstitial_banner_ad',
    'banner_728x90', 'banner_468x60', 'banner_336x280',
    'enable_popup', 'popup_ad_url',
    'payout_rates_interstitial', 'payout_rates_banner', 'payout_rates_popup',
    'enable_captcha', 'recaptcha_site_key', 'recaptcha_secret_key',
    'maintenance_mode', 'disallowed_domains', 'footer_text',
  ]

  const options = await getOptions(keys)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Site <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-muted-foreground mt-1">Configure all platform settings</p>
      </div>
      <AdminSettingsForm options={options} />
    </div>
  )
}
