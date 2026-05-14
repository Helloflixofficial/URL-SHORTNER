import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import SessionProvider from '@/components/providers/session-provider'
import { auth } from '@/lib/auth'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space', display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: 'Linksite — Shorten Links & Earn Money',
    template: '%s | Linksite',
  },
  description:
    'Linksite is the #1 link monetization platform. Shorten URLs, share them, and earn real money from every visitor.',
  keywords: ['link shortener', 'earn money', 'url shortener', 'monetize links', 'short url'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXTAUTH_URL ?? 'https://linksite.io',
    siteName: 'Linksite',
    title: 'Linksite — Shorten Links & Earn Money',
    description: 'The #1 link monetization platform. Earn from every click.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Linksite — Shorten Links & Earn Money',
    description: 'The #1 link monetization platform.',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  return (
    <html lang="en" className="dark">
      <head />
      <body className={`${inter.variable} ${spaceGrotesk.variable} bg-background text-foreground antialiased`}>
        <SessionProvider session={session}>
          <TooltipProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                classNames: {
                  toast: 'glass border-border',
                  title: 'text-foreground font-semibold',
                  description: 'text-muted-foreground',
                },
              }}
            />
          </TooltipProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
