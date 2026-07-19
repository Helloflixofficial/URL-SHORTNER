import { prisma } from '@/lib/prisma'
import { getOption, getJsonOption } from '@/lib/options'

/**
 * View reasons (mirrored from Adlinkfly PHP source):
 * 1  - Earn (paid)
 * 2  - Disabled cookie
 * 3  - Anonymous user link
 * 4  - Adblock detected
 * 5  - Proxy detected
 * 6  - IP changed between view and go
 * 7  - Not unique (duplicate)
 * 8  - Campaign item weight full (100%)
 * 9  - Default campaign
 * 10 - Direct link (no ads)
 * 11 - Invalid country (Others)
 * 12 - Earnings globally disabled
 * 13 - User disabled earnings
 * 14 - Blocked referrer domain
 */
export const EARN_REASON = {
  EARN: 1,
  NO_COOKIE: 2,
  ANONYMOUS: 3,
  ADBLOCK: 4,
  PROXY: 5,
  IP_CHANGED: 6,
  NOT_UNIQUE: 7,
  WEIGHT_FULL: 8,
  DEFAULT_CAMPAIGN: 9,
  DIRECT: 10,
  INVALID_COUNTRY: 11,
  EARNINGS_DISABLED_GLOBAL: 12,
  EARNINGS_DISABLED_USER: 13,
  BLOCKED_REFERER: 14,
} as const

export interface AdFormData {
  mode: 'simple' | 'campaign'
  alias: string
  ci: string    // campaign id
  cui: string   // campaign user id
  cii: string   // campaign item id
  country: string
  advertiserPrice: number
  publisherPrice: number
  adType: number
  timer: number
  t: number     // timestamp
}

export interface EarningsResult {
  status: 'success' | 'error'
  message: string
  url: string
}

export async function recordUnpaidVisit(
  link: { id: string; userId: string },
  options: {
    ip: string
    country: string
    device: number
    adType: number
    reason?: number
    refererUrl?: string | null
  },
) {
  await prisma.$transaction([
    prisma.statistic.create({
      data: {
        linkId: link.id,
        userId: link.userId,
        ip: options.ip,
        country: options.country,
        device: options.device,
        adType: options.adType,
        reason: options.reason ?? EARN_REASON.DIRECT,
        advertiserPrice: 0,
        publisherPrice: 0,
        refererUrl: options.refererUrl ?? null,
      },
    }),
    prisma.link.update({ where: { id: link.id }, data: { hits: { increment: 1 } } }),
  ])
}

/**
 * Full port of Adlinkfly's calcEarnings() PHP function.
 * Determines whether a view should be paid and at what rate,
 * records the statistic, and returns the destination URL.
 */
export async function calcEarnings(
  data: AdFormData,
  link: { id: string; userId: string; url: string; alias: string },
  adType: number,
  ip: string,
  cookieData: { ip: string; id: string } | null,
  hasAdblock: boolean,
): Promise<EarningsResult> {

  const redirectUrl = link.url

  async function recordAndReturn(reason: number, publisherPrice = 0, advertiserPrice = 0) {
    await prisma.$transaction([
      prisma.statistic.create({
        data: {
          linkId: link.id,
          userId: link.userId,
          ip,
          country: data.country,
          device: 2,
          adType,
          reason,
          publisherPrice,
          advertiserPrice,
          campaignId: data.ci || null,
          campaignUserId: data.cui || null,
          campaignItemId: data.cii || null,
        },
      }),
      prisma.link.update({ where: { id: link.id }, data: { hits: { increment: 1 } } }),
    ])
    return { status: 'success' as const, message: '', url: redirectUrl }
  }

  // 1. Check user earnings disabled
  const linkUser = await prisma.user.findUnique({ where: { id: link.userId }, select: { disableEarnings: true } })
  if (linkUser?.disableEarnings) return recordAndReturn(EARN_REASON.EARNINGS_DISABLED_USER)

  // 2. Check global earnings toggle
  const earningsEnabled = await getOption('enable_publisher_earnings', '1')
  if (earningsEnabled !== '1') return recordAndReturn(EARN_REASON.EARNINGS_DISABLED_GLOBAL)

  // 3. Invalid country
  if (!data.country || data.country === 'Others') return recordAndReturn(EARN_REASON.INVALID_COUNTRY)

  // 4. No cookie
  if (!cookieData) return recordAndReturn(EARN_REASON.NO_COOKIE)

  // 5. Anonymous link owner check (userId === 1 is the anonymous user)
  if (link.userId === '000000000000000000000001') return recordAndReturn(EARN_REASON.ANONYMOUS)

  // 6. IP changed
  if (cookieData.ip !== ip) return recordAndReturn(EARN_REASON.IP_CHANGED)

  // 6.5. Not Unique (24h IP Check)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const existingPaidView = await prisma.statistic.findFirst({
    where: {
      userId: link.userId,
      ip: ip,
      reason: EARN_REASON.EARN,
      createdAt: { gte: twentyFourHoursAgo },
    },
    select: { id: true },
  })
  if (existingPaidView) return recordAndReturn(EARN_REASON.NOT_UNIQUE)

  // 7. Adblock detected
  if (hasAdblock) return recordAndReturn(EARN_REASON.ADBLOCK)

  // 8. Campaign-mode specific checks
  if (data.mode === 'campaign' && data.cii) {
    const campaignItem = await prisma.campaignItem.findFirst({
      where: { id: data.cii, weight: { lt: 100 } },
      include: { campaign: { select: { status: true, defaultCampaign: true } } },
    })
    if (!campaignItem) return recordAndReturn(EARN_REASON.WEIGHT_FULL)
    if (campaignItem.campaign.defaultCampaign) return recordAndReturn(EARN_REASON.DEFAULT_CAMPAIGN)
    if (campaignItem.campaign.status !== 1) return recordAndReturn(EARN_REASON.WEIGHT_FULL)

    // Debit advertiser, credit publisher
    const pub = data.publisherPrice
    const adv = data.advertiserPrice

    await prisma.$transaction([
      prisma.user.update({ where: { id: link.userId }, data: { balance: { increment: pub }, totalEarned: { increment: pub } } }),
      prisma.user.update({ where: { id: data.cui }, data: { balance: { decrement: adv } } }),
      prisma.campaign.update({ where: { id: data.ci }, data: { spent: { increment: adv } } }),
      prisma.campaignItem.update({ where: { id: data.cii }, data: { weight: { increment: 1 } } }),
    ])

    // Referral Commission (Campaign)
    await payReferrer(link.userId, pub)

    await recordAndReturn(EARN_REASON.EARN, pub, adv)
    return { status: 'success', message: '', url: redirectUrl }
  }

  // 9. Simple mode payout
  if (data.mode === 'simple') {
    const pub = data.publisherPrice
    if (pub > 0) {
      await prisma.user.update({ where: { id: link.userId }, data: { balance: { increment: pub }, totalEarned: { increment: pub } } })
      // Referral Commission (Simple)
      await payReferrer(link.userId, pub)
    }
    await recordAndReturn(EARN_REASON.EARN, pub, 0)
    return { status: 'success', message: '', url: redirectUrl }
  }

  return recordAndReturn(EARN_REASON.EARN)
}

/**
 * Helper to credit referral commission to the referrer.
 */
async function payReferrer(userId: string, amount: number) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { referralId: true } })
    if (!user?.referralId) return

    const refPercentRaw = await prisma.option.findUnique({ where: { key: 'referral_percentage' } })
    const refPercent = parseFloat(refPercentRaw?.value || '20')
    const commission = amount * (refPercent / 100)

    if (commission > 0) {
      await prisma.user.update({
        where: { id: user.referralId },
        data: {
          balance: { increment: commission },
          totalEarned: { increment: commission },
          referralEarnings: { increment: commission }
        }
      })
    }
  } catch (err) {
    console.error('Referral payment error:', err)
  }
}

/**
 * Match a paid ad from campaigns or simple rates for the given parameters.
 */
export async function getPaidAds(
  adType: number,
  trafficSource: number,
  country: string,
): Promise<AdFormData & { websiteUrl?: string; bannerSize?: string; bannerCode?: string }> {
  const earningMode = await getOption('earning_mode', 'simple')

  if (earningMode === 'simple') {
    const rateKey =
      adType === 1 ? 'payout_rates_interstitial'
      : adType === 2 ? 'payout_rates_banner'
      : 'payout_rates_popup'

    const rates = await getJsonOption<Record<string, Record<number, number>>>(rateKey, {})
    const pub =
      rates?.[country]?.[trafficSource] ??
      rates?.['all']?.[trafficSource] ??
      0

    return {
      mode: 'simple',
      alias: '',
      ci: '', cui: '', cii: '',
      country,
      advertiserPrice: 0,
      publisherPrice: pub,
      adType,
      timer: 5,
      t: Date.now(),
      websiteUrl: await getOption(adType === 1 ? 'interstitial_ad_url' : 'popup_ad_url', ''),
    }
  }

  // Campaign mode — find matching campaign item
  const campaignItem = await prisma.campaignItem.findFirst({
    where: {
      weight: { lt: 100 },
      country: { in: [country, 'all'] },
      campaign: {
        adType,
        status: 1,
        defaultCampaign: false,
        trafficSource: { in: [1, trafficSource] },
      },
    },
    include: { campaign: true },
    orderBy: { weight: 'asc' },
  })

  if (!campaignItem) {
    return {
      mode: 'simple',
      alias: '', ci: '', cui: '', cii: '',
      country, advertiserPrice: 0, publisherPrice: 0,
      adType, timer: 5, t: Date.now(),
    }
  }

  return {
    mode: 'campaign',
    alias: '',
    ci: campaignItem.campaignId,
    cui: campaignItem.campaign.userId,
    cii: campaignItem.id,
    country,
    advertiserPrice: campaignItem.advertiserPrice,
    publisherPrice: campaignItem.publisherPrice,
    adType,
    timer: 5,
    t: Date.now(),
    websiteUrl: campaignItem.campaign.websiteUrl,
    bannerSize: campaignItem.campaign.bannerSize ?? '',
    bannerCode: campaignItem.campaign.bannerCode ?? '',
  }
}
