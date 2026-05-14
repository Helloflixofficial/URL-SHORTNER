const fs = require('fs');
let seed = fs.readFileSync('prisma/seed.ts', 'utf8');

// Replace upserts with deleteMany + create
// This handles the weird Prisma MongoDB upsert bug

// For Plans
seed = seed.replace(/const freePlan = await prisma\.plan\.upsert\({[\s\S]*?}\)/, `await prisma.plan.deleteMany({});
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
  })`);

seed = seed.replace(/await prisma\.plan\.upsert\({[\s\S]*?where: { id: '000000000000000000000011' }[\s\S]*?}\)/, `await prisma.plan.create({
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
  })`);

seed = seed.replace(/await prisma\.plan\.upsert\({[\s\S]*?where: { id: '000000000000000000000012' }[\s\S]*?}\)/, `await prisma.plan.create({
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
  })`);

// For Admin
seed = seed.replace(/const admin = await prisma\.user\.upsert\({[\s\S]*?}\)/, `await prisma.user.deleteMany({});
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: process.env.ADMIN_EMAIL ?? 'admin@linksite.io',
      password: adminPassword,
      role: 'admin',
      status: 'active',
      balance: 0,
    }
  })`);

// For Anonymous
seed = seed.replace(/await prisma\.user\.upsert\({[\s\S]*?anonymous@linksite\.io' }[\s\S]*?}\)/, `await prisma.user.create({
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
  })`);

// For Pages
seed = seed.replace(/await prisma\.page\.upsert\({[\s\S]*?slug: 'about' }[\s\S]*?}\)/, `await prisma.page.deleteMany({});
  await prisma.page.create({
    data: {
      slug: 'about',
      title: 'About Linksite',
      content: '<h2>About Us</h2><p>Linksite is the #1 link monetization and URL shortening platform. We help content creators, bloggers, and marketers earn money from every link they share.</p>',
      published: true,
    }
  })`);

seed = seed.replace(/await prisma\.page\.upsert\({[\s\S]*?slug: 'terms' }[\s\S]*?}\)/, `await prisma.page.create({
    data: {
      slug: 'terms',
      title: 'Terms of Service',
      content: '<h2>Terms of Service</h2><p>By using Linksite, you agree to our terms of service. Please read them carefully before using our platform.</p>',
      published: true,
    }
  })`);

seed = seed.replace(/await prisma\.page\.upsert\({[\s\S]*?slug: 'privacy' }[\s\S]*?}\)/, `await prisma.page.create({
    data: {
      slug: 'privacy',
      title: 'Privacy Policy',
      content: '<h2>Privacy Policy</h2><p>We take your privacy seriously. This policy explains how we collect, use, and protect your personal information.</p>',
      published: true,
    }
  })`);

fs.writeFileSync('prisma/seed.ts', seed);
console.log("Seed rewritten to avoid upserts.");
