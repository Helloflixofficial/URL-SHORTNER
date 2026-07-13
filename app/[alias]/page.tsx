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

  // Redirect visitors through random blog posts (Blog Post Interstitial)
  const postCount = await prisma.post.count({ where: { status: 'published' } })
  if (postCount > 0) {
    const skip = Math.floor(Math.random() * postCount)
    const randomPost = await prisma.post.findFirst({
      where: { status: 'published' },
      skip: skip,
      select: { slug: true },
    })
    if (randomPost) {
      const adData = await getPaidAds(adType, device, country)
      adData.alias = alias
      const customTimer = await getOption('ads_blog_interstitial_timer', '25')
      adData.timer = Number(customTimer)
      adData.t = getRequestTimestamp()
      const adFormDataEncoded = Buffer.from(JSON.stringify({ ...adData, country, adType })).toString('base64')

      redirect(`/blog/${randomPost.slug}?alias=${alias}&step=1&data=${adFormDataEncoded}`)
    }
  }

  // Fallback: direct redirect if no published posts exist
  await redirectWithUnpaidHit(adType)
}
