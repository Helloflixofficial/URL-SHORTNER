const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Linksite database...')

  // Plans
  await prisma.plan.upsert({ where: { id: 1 }, update: {}, create: { name: 'Free', price: 0, linksLimit: 20, linkExpiration: false, direct: false, disableAds: false, disableCaptcha: false, onetimeCaptcha: false, visitorsRemoveCaptcha: false, timer: 5, isDefault: true, features: JSON.stringify(['20 links', '5s ad timer', 'Basic stats', 'All ad types']) } })
  await prisma.plan.upsert({ where: { id: 2 }, update: {}, create: { name: 'Pro', price: 9.99, linksLimit: -1, linkExpiration: true, direct: false, disableAds: false, disableCaptcha: true, timer: 3, isDefault: false, features: JSON.stringify(['Unlimited links', '3s ad timer', 'Advanced stats', 'No captcha', 'Link expiry', 'Priority support']) } })
  await prisma.plan.upsert({ where: { id: 3 }, update: {}, create: { name: 'Elite', price: 24.99, linksLimit: -1, linkExpiration: true, direct: true, disableAds: true, disableCaptcha: true, visitorsRemoveCaptcha: true, timer: 0, isDefault: false, features: JSON.stringify(['Unlimited links', 'Direct links (no ads)', 'No ads for visitors', 'No captcha', 'Link expiry', 'Custom alias', '24/7 support']) } })
  console.log('✅ Plans created')

  // Admin user
  const adminPass = await bcrypt.hash('Admin@123456', 12)
  const admin = await prisma.user.upsert({ where: { email: 'admin@linksite.io' }, update: {}, create: { username: 'admin', email: 'admin@linksite.io', password: adminPass, role: 'admin', status: 'active', balance: 0 } })
  console.log('✅ Admin:', admin.email)

  // Anonymous user
  const anonPass = await bcrypt.hash('anon_' + Math.random(), 12)
  await prisma.user.upsert({ where: { email: 'anonymous@linksite.io' }, update: {}, create: { username: 'anonymous', email: 'anonymous@linksite.io', password: anonPass, role: 'member', status: 'active', balance: 0, disableEarnings: true } })
  console.log('✅ Anonymous user created')

  // Default options
  const opts = {
    site_name: 'Linksite', site_description: 'Shorten links and earn money. The #1 link monetization platform.', site_email: 'hello@linksite.io',
    earning_mode: 'simple', enable_publisher_earnings: '1', enable_captcha: 'no',
    alias_min_length: '5', alias_max_length: '7', disallowed_domains: '',
    member_default_advert: '1', anonymous_default_advert: '1',
    interstitial_ad_url: '', interstitial_banner_ad: '', banner_728x90: '', banner_468x60: '', banner_336x280: '',
    popup_ad_url: '', enable_popup: 'no',
    min_withdrawal: '5', withdrawal_methods: 'paypal,bank',
    payout_rates_interstitial: JSON.stringify({ all: { 2: 0.003, 3: 0.002 } }),
    payout_rates_banner: JSON.stringify({ all: { 2: 0.002, 3: 0.001 } }),
    payout_rates_popup: JSON.stringify({ all: { 2: 0.001, 3: 0.001 } }),
    maintenance_mode: '0', footer_text: '© 2025 Linksite. All rights reserved.',
    recaptcha_site_key: '', recaptcha_secret_key: '', continue_pages_number: '0',
  }
  for (const [key, value] of Object.entries(opts)) {
    await prisma.option.upsert({ where: { key }, update: {}, create: { key, value } })
  }
  console.log('✅ Default options seeded')

  // Testimonials
  for (const t of [
    { name: 'Alex Johnson', text: "Linksite has been a game changer! I earn passive income from my blog links every day.", rating: 5 },
    { name: 'Sarah Williams', text: "The analytics dashboard is stunning and payouts are always on time. Love it!", rating: 5 },
    { name: 'Mike Chen', text: "Best CPM rates I've found. Withdrew my first payment within 2 weeks.", rating: 5 },
  ]) {
    try { await prisma.testimonial.create({ data: { ...t, published: true } }) } catch {}
  }
  console.log('✅ Testimonials seeded')

  // Static pages
  for (const p of [
    { slug: 'about', title: 'About Linksite', content: '<h2>About Us</h2><p>Linksite is the #1 link monetization and URL shortening platform.</p>' },
    { slug: 'terms', title: 'Terms of Service', content: '<h2>Terms of Service</h2><p>By using Linksite, you agree to our terms.</p>' },
    { slug: 'privacy', title: 'Privacy Policy', content: '<h2>Privacy Policy</h2><p>We take your privacy seriously.</p>' },
  ]) {
    await prisma.page.upsert({ where: { slug: p.slug }, update: {}, create: { ...p, published: true } })
  }
  console.log('✅ Pages seeded')

  console.log('\n🎉 Done!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Admin: admin@linksite.io')
  console.log('Password: Admin@123456')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main().catch(console.error).finally(() => prisma.$disconnect())
