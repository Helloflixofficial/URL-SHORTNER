import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider } from "@clerk/nextjs";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Linksite — Shorten Links & Earn Money",
    template: "%s | Linksite",
  },
  description:
    "Linksite is the #1 link monetization platform. Shorten URLs, share them, and earn real money from every visitor.",
  keywords: [
    "link shortener",
    "earn money",
    "url shortener",
    "monetize links",
    "short url",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXTAUTH_URL ?? "https://linksite.io",
    siteName: "Linksite",
    title: "Linksite — Shorten Links & Earn Money",
    description: "The #1 link monetization platform. Earn from every click.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Linksite — Shorten Links & Earn Money",
    description: "The #1 link monetization platform.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${geist.variable} ${geistMono.variable} ${spaceGrotesk.variable}`}
    >
      <head />
      <body className="bg-background text-foreground antialiased">
        <ClerkProvider>
          <TooltipProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                classNames: {
                  toast: "glass border-border",
                  title: "text-foreground font-semibold",
                  description: "text-muted-foreground",
                },
              }}
            />
          </TooltipProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
