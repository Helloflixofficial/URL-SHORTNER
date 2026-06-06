import AdminSettingsForm from '@/components/admin/settings-form'
import { getOptions } from '@/lib/options'

export const metadata = { title: 'Admin — Settings' }

export default async function AdminSettingsPage() {
  const keys = [
    // General
    'site_name', 'site_description', 'site_email', 'earning_mode',
    'enable_publisher_earnings', 'member_default_advert', 'anonymous_default_advert',
    'min_withdrawal', 'alias_min_length', 'alias_max_length',
    'maintenance_mode', 'disallowed_domains', 'referral_percentage',
    // Ads
    'interstitial_ad_url', 'interstitial_banner_ad',
    'banner_728x90', 'banner_468x60', 'banner_336x280',
    'enable_popup', 'popup_ad_url',
    // Payouts
    'min_withdrawal', 'withdraw_processing_time',
    // Withdraw methods
    'withdraw_method_paypal', 'withdraw_method_bitcoin', 'withdraw_method_bank_transfer',
    'withdraw_method_payeer', 'withdraw_method_skrill',
    // Payout rates
    'payout_rates_interstitial', 'payout_rates_banner', 'payout_rates_popup',
    // Security / CAPTCHA
    'enable_captcha', 'recaptcha_site_key', 'recaptcha_secret_key',
    // Email / SMTP
    'mail_driver', 'smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'smtp_encryption',
    // Social Login OAuth
    'google_client_id', 'google_client_secret',
    'facebook_app_id', 'facebook_app_secret',
    // Advanced
    'footer_text', 'custom_css', 'custom_js_header',
  ]

  const options = await getOptions(keys)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-display">
          Site <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-muted-foreground mt-1">Configure all platform settings</p>
      </div>
      <AdminSettingsForm options={options} />
    </div>
  )
}
