import Link from 'next/link'
import { Link2, ExternalLink, Globe, Play, Camera } from 'lucide-react'

const footerLinks = {
  Product: [
    { href: '/payout-rates', label: 'Payout Rates' },
    { href: '/payouts', label: 'Payment Proofs' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ],
  Legal: [
    { href: '/p/terms', label: 'Terms of Service' },
    { href: '/p/privacy', label: 'Privacy Policy' },
    { href: '/p/about', label: 'About Us' },
  ],
  Account: [
    { href: '/login', label: 'Sign In' },
    { href: '/register', label: 'Create Account' },
    { href: '/dashboard', label: 'Dashboard' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-border/40 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-bg-primary">
                <Link2 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="gradient-text font-bold text-xl font-display">
                Linksite
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              The #1 link monetization platform. Shorten links and earn real money from every visitor.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: ExternalLink, href: '#', label: 'Website' },
                { Icon: Globe, href: '#', label: 'Globe' },
                { Icon: Play, href: '#', label: 'YouTube' },
                { Icon: Camera, href: '#', label: 'Instagram' },
              ].map(({ Icon, href, label }, i) => (
                <a key={i} href={href} aria-label={label}
                  className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors duration-150">
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="font-semibold text-sm text-foreground mb-3">{group}</h4>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-150">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Linksite. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-glow inline-block" />
            <span className="text-xs text-muted-foreground">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
