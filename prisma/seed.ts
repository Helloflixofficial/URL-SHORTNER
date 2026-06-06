import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Linksite database...')

  // ---------- Plans ----------
  await prisma.plan.deleteMany({});
  const freePlan = await prisma.plan.create({
    data: {
      id: '000000000000000000000010',
      name: 'Free',
      price: 0,
      linksLimit: 20,
      viewsHourlyLimit: 0,
      viewsDailyLimit: 0,
      viewsMonthlyLimit: 0,
      linkExpiration: false,
      direct: false,
      disableAds: false,
      disableCaptcha: false,
      onetimeCaptcha: false,
      visitorsRemoveCaptcha: false,
      timer: 5,
      isDefault: true,
      features: JSON.stringify(['20 links', '5s ad timer', 'Basic stats', 'All ad types']),
    }
  })

  await prisma.plan.create({
    data: {
      id: '000000000000000000000011',
      name: 'Pro',
      price: 9.99,
      linksLimit: -1,
      viewsHourlyLimit: 0,
      viewsDailyLimit: 0,
      viewsMonthlyLimit: 0,
      linkExpiration: true,
      direct: false,
      disableAds: false,
      disableCaptcha: true,
      onetimeCaptcha: false,
      visitorsRemoveCaptcha: false,
      timer: 3,
      isDefault: false,
      features: JSON.stringify(['Unlimited links', '3s ad timer', 'Advanced stats', 'No captcha', 'Link expiry', 'Priority support']),
    }
  })

  await prisma.plan.create({
    data: {
      id: '000000000000000000000012',
      name: 'Elite',
      price: 24.99,
      linksLimit: -1,
      viewsHourlyLimit: 0,
      viewsDailyLimit: 0,
      viewsMonthlyLimit: 0,
      linkExpiration: true,
      direct: true,
      disableAds: true,
      disableCaptcha: true,
      onetimeCaptcha: false,
      visitorsRemoveCaptcha: true,
      timer: 0,
      isDefault: false,
      features: JSON.stringify(['Unlimited links', 'Direct links (no ads)', 'No ads for visitors', 'No captcha', 'Link expiry', 'Custom alias', '24/7 support']),
    }
  })

  console.log('✅ Plans created')

  // ---------- Owner user ----------
  const ownerEmail = process.env.OWNER_EMAIL ?? process.env.ADMIN_EMAIL ?? 'owner@linksite.io'
  const ownerPlainPassword = process.env.OWNER_PASSWORD ?? process.env.ADMIN_PASSWORD ?? 'Owner@123456'
  const ownerPassword = await bcrypt.hash(ownerPlainPassword, 12)
  await prisma.user.deleteMany({});
  const owner = await prisma.user.create({
    data: {
      username: 'owner',
      email: ownerEmail,
      password: ownerPassword,
      role: 'owner',
      status: 'active',
      balance: 0,
    }
  })
  console.log('✅ Owner user:', owner.email)

  // ---------- Anonymous user (userId = 1 convention) ----------
  const anonPassword = await bcrypt.hash('anonymous_no_login_' + Math.random(), 12)
  await prisma.user.create({
    data: {
      id: '000000000000000000000001',
      username: 'anonymous',
      email: 'anonymous@linksite.io',
      password: anonPassword,
      role: 'member',
      status: 'active',
      balance: 0,
      disableEarnings: true,
    }
  })
  console.log('✅ Anonymous user created')

  // ---------- Default site options ----------
  const defaultOptions: Record<string, string> = {
    site_name: 'Linksite',
    site_description: 'Shorten links and earn money. The #1 link monetization platform.',
    site_logo: '',
    site_email: 'hello@linksite.io',
    earning_mode: 'simple',
    enable_publisher_earnings: '1',
    enable_captcha: 'no',
    captcha_type: 'recaptcha',
    recaptcha_site_key: '',
    recaptcha_secret_key: '',
    hcaptcha_site_key: '',
    hcaptcha_secret_key: '',
    alias_min_length: '5',
    alias_max_length: '7',
    disallowed_domains: '',
    reserved_aliases: 'admin,api,login,register,dashboard',
    member_default_advert: '1',
    anonymous_default_advert: '1',
    interstitial_ad_url: '',
    interstitial_banner_ad: '',
    banner_728x90: '',
    banner_468x60: '',
    banner_336x280: '',
    popup_ad_url: '',
    enable_popup: 'no',
    min_withdrawal: '5',
    withdrawal_methods: 'paypal,bank',
    payout_rates_interstitial: JSON.stringify({ all: { 2: 0.003, 3: 0.002 } }),
    payout_rates_banner: JSON.stringify({ all: { 2: 0.002, 3: 0.001 } }),
    payout_rates_popup: JSON.stringify({ all: { 2: 0.001, 3: 0.001 } }),
    maintenance_mode: '0',
    continue_pages_number: '0',
    links_per_page: '20',
    footer_text: '© 2025 Linksite. All rights reserved.',
    social_facebook: '',
    social_twitter: '',
    social_instagram: '',
    social_youtube: '',
  }

  await prisma.option.deleteMany({})
  for (const [key, value] of Object.entries(defaultOptions)) {
    await prisma.option.create({
      data: { key, value },
    })
  }
  console.log('✅ Default options seeded')

  // ---------- Sample testimonials ----------
  const testimonials = [
    { name: 'Alex Johnson', text: 'Linksite has been a game changer for my blog! I\'ve been earning passive income from my content links for 3 months now.', rating: 5 },
    { name: 'Sarah Williams', text: 'The dashboard is so clean and easy to use. I can track all my stats in real-time. Highly recommended!', rating: 5 },
    { name: 'Mike Chen', text: 'Withdrew my first payment within 2 weeks of signing up. The rates are competitive and payouts are reliable.', rating: 5 },
  ]
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: { ...t, published: true } }).catch(() => {})
  }
  console.log('✅ Testimonials seeded')

  // ---------- Sample static pages ----------
  await prisma.page.deleteMany({});
  await prisma.page.create({
    data: {
      slug: 'about',
      title: 'About Linksite',
      content: '<h2>About Us</h2><p>Linksite is the #1 link monetization and URL shortening platform. We help content creators, bloggers, and marketers earn money from every link they share.</p>',
      published: true,
    }
  })

  await prisma.page.create({
    data: {
      slug: 'terms',
      title: 'Terms of Service',
      content: '<h2>Terms of Service</h2><p>By using Linksite, you agree to our terms of service. Please read them carefully before using our platform.</p>',
      published: true,
    }
  })

  await prisma.page.create({
    data: {
      slug: 'privacy',
      title: 'Privacy Policy',
      content: '<h2>Privacy Policy</h2><p>We take your privacy seriously. This policy explains how we collect, use, and protect your personal information.</p>',
      published: true,
    }
  })
  console.log('✅ Pages seeded')

  console.log('\n🎉 Database seeded successfully!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Owner: ${ownerEmail}`)
  console.log(`Password: ${ownerPlainPassword}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
