import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getOption } from '@/lib/options'
import { isBot, getClientIp, getDeviceType, getCountryFromIp } from '@/lib/geo'
import { EARN_REASON, getPaidAds, recordUnpaidVisit } from '@/lib/earnings'
import InterstitialPage from '@/components/ads/interstitial-page'
import BannerPage from '@/components/ads/banner-page'

interface AliasPageProps {
  params: Promise<{ alias: string }>
}

function resolveAdType(adType: number) {
  if (adType !== 3) return adType
  return Math.random() > 0.5 ? 1 : 2
}

function getRequestTimestamp() {
  return Date.now()
}

export default async function AliasPage({ params }: AliasPageProps) {
  const { alias } = await params
  const headersList = await headers()
  const ua = headersList.get('user-agent') ?? ''
  const ip = getClientIp(headersList)
  const refererUrl = headersList.get('referer')

  const link = await prisma.link.findUnique({
    where: { alias },
    include: {
      user: { select: { id: true, username: true, status: true, disableEarnings: true } },
    },
  })

  if (!link) notFound()
  if (link.status === 3) notFound()
  const activeLink = link
  if (activeLink.user.status !== 'active') notFound()

  // Expired link
  if (link.expiration && new Date() > link.expiration) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-bg">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Link Expired</h1>
          <p className="text-muted-foreground">This link has expired and is no longer available.</p>
        </div>
      </div>
    )
  }

  // Maintenance mode → direct redirect
  const country = getCountryFromIp(ip)
  const device = getDeviceType(ua)

  async function redirectWithUnpaidHit(adType: number, reason = EARN_REASON.DIRECT) {
    await recordUnpaidVisit(
      { id: activeLink.id, userId: activeLink.userId },
      { ip, country, device, adType, reason, refererUrl },
    )
    redirect(activeLink.url)
  }

  const maintenance = await getOption('maintenance_mode', '0')
  if (maintenance === '1') await redirectWithUnpaidHit(link.adType)

  // Bot detection → direct redirect
  if (isBot(ua)) await redirectWithUnpaidHit(link.adType)

  // Determine ad type
  const adType = resolveAdType(activeLink.adType)
  // Random → pick between 1 (interstitial) and 2 (banner)
  // Direct or no-ad
  if (adType === 0) await redirectWithUnpaidHit(adType)

  // Get paid ad data
  const adData = await getPaidAds(adType, device, country)
  adData.alias = alias

  // CAPTCHA settings
  const enableCaptcha = await getOption('enable_captcha', 'no')
  const captchaType = await getOption('captcha_type', 'recaptcha')
  const captchaSiteKey = await getOption(captchaType === 'recaptcha' ? 'recaptcha_site_key' : 'hcaptcha_site_key', '')

  // Timer from user plan (default 5s)
  const userPlan = await prisma.userPlan.findUnique({
    where: { userId: activeLink.userId },
    include: { plan: true },
  })
  const timer = userPlan?.plan.timer ?? 15
  adData.timer = timer
  adData.t = getRequestTimestamp()

  // Encode ad form data for client
  const adFormDataEncoded = Buffer.from(JSON.stringify({ ...adData, country, adType })).toString('base64')

  // Banner ads
  if (adType === 2) {
    const banner728 = await getOption('banner_728x90', '')
    const banner468 = await getOption('banner_468x60', '')
    const banner336 = await getOption('banner_336x280', '')
    return (
      <BannerPage
        link={{ url: link.url, alias: link.alias, title: link.title ?? '' }}
        adFormDataEncoded={adFormDataEncoded}
        timer={timer}
        banner728={banner728}
        banner468={banner468}
        banner336={banner336}
        captcha={{ enabled: enableCaptcha === 'yes', type: captchaType, siteKey: captchaSiteKey }}
      />
    )
  }

  // Interstitial ads (default)
  const interstitialAd = await getOption('interstitial_banner_ad', '')
  const interstitialUrl = adData.websiteUrl ?? ''

  return (
    <InterstitialPage
      link={{ url: link.url, alias: link.alias, title: link.title ?? '' }}
      adFormDataEncoded={adFormDataEncoded}
      timer={timer}
      interstitialBannerAd={interstitialAd}
      interstitialAdUrl={interstitialUrl}
      captcha={{ enabled: enableCaptcha === 'yes', type: captchaType, siteKey: captchaSiteKey }}
    />
  )
}
