<div align="center">
  <img src="https://img.icons8.com/clouds/200/link.png" alt="Linksite Logo" width="120" />
  <h1>🚀 Linksite</h1>
  <p><strong>The Ultimate Next-Generation URL Shortener & Monetization Platform</strong></p>
</div>

<br />

**Linksite** is a highly advanced, modern, and lightning-fast URL shortening platform built with Next.js 14. Designed for both site administrators and users, it allows users to shorten links, share them, and earn money through optimized ad campaigns (Banner and Interstitial ads). Think of it as a state-of-the-art alternative to traditional platforms like AdLinkFly.

With a meticulously crafted animated user interface, a robust MongoDB backend, and comprehensive admin controls, Linksite is production-ready for link shortening businesses.

---

## ✨ Key Features

### 🛡️ For Administrators
- **Complete Admin Dashboard**: Manage users, links, active campaigns, and track platform-wide earnings and clicks in real-time.
- **Campaign Management**: Approve, reject, or manage advertiser campaigns. Dynamically adjust ad rates based on countries and device types.
- **Withdrawal Processing**: Review and approve user payout requests automatically via PayPal integration.
- **Site Settings Control**: Configure global settings, maintenance modes, minimum withdrawal amounts, and CAPTCHA integrations straight from the UI.
- **Advanced Bot & Geo Detection**: Built-in IP lookups, bot blocking, and device fingerprinting to ensure accurate analytics and prevent fraud.

### 👥 For Users & Publishers
- **Real-Time Analytics Dashboard**: Users can track their link views, CTR, and earnings via beautiful interactive charts.
- **Monetization**: Earn money dynamically per click. Rates adjust automatically based on publisher plans and geo-location.
- **Multiple Ad Types**: Supports both full-screen Interstitial ads (with interactive countdown timers) and non-intrusive Banner ads.
- **Withdrawals**: Built-in system for users to request payouts straight to their accounts.
- **Sleek UI/UX**: Enjoy a dynamic, glass-morphic, and animated interface featuring live particle backgrounds and seamless transitions.

---

## 🛠️ Tech Stack & Tools

Linksite is built on the bleeding-edge of web development technologies:

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
- **Language:** [TypeScript](https://www.typescriptlang.org/) for end-to-end type safety
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database:** [MongoDB](https://www.mongodb.com/) (NoSQL)
- **Authentication:** [NextAuth.js v5](https://authjs.dev/) (Credentials, secure session management)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) + Radix UI Primitives
- **Charts:** [Recharts](https://recharts.org/)
- **Animations:** Custom CSS, Tailwind Animate, and `react-tsparticles`
- **Email:** [Resend](https://resend.com/) + `react-email`

---

## 📋 Requirements

Before installing, ensure your deployment environment meets the following requirements:

- **Node.js**: Version 18.x or newer
- **Database**: A running MongoDB instance (e.g., MongoDB Atlas)
- **Package Manager**: `npm` (v9+) or `yarn` / `pnpm`
- **SMTP/Email**: Optional, but recommended for password resets

---

## 🚀 Getting Started

Follow these steps to get Linksite running on your local machine.

### 1. Clone the repository
```bash
git clone https://github.com/Helloflixofficial/URL-SHORTNER.git
cd URL-SHORTNER
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory and add the following required variables:

```env
# Database configuration
DATABASE_URL="mongodb+srv://<user>:<password>@cluster.mongodb.net/linksite"

# NextAuth configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-strong-random-secret-here"

# (Optional) Email Configuration
RESEND_API_KEY="your-resend-api-key"
```

### 4. Push Database Schema & Seed Data
Initialize your MongoDB collections and populate the default admin settings and user plans:
```bash
npm run db:push
npm run db:seed
```

### 5. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. 

*(Default Admin Credentials after seeding: Username: `admin`, Password: `password123`)*

---

## 🎨 Customization

Linksite is extremely customizable:
- **Colors & Themes**: Modify `app/globals.css` to tweak the primary gradients, glassmorphism intensities, and CSS variables.
- **Backgrounds**: The `LiveBackground` component handles the interactive particle effects on the front page.
- **Ads & Scripts**: All external ad scripts and head codes can be modified dynamically via the Admin Settings dashboard—no hardcoding required.

---

## 📄 License & Legal

This project is intended for educational and personal deployment purposes. Please ensure your ad networks and monetization strategies comply with their respective terms of service.
