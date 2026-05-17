import { Button } from '@/components/ui/button'
import ShortenForm from '@/components/front/shorten-form'
import {
  Zap, BarChart3, Globe, Shield, Clock,
  TrendingUp, ArrowRight, Star,
} from 'lucide-react'
import { Metadata } from 'next'
import LiveBackground from '@/components/front/live-background'

export const metadata: Metadata = {
  title: 'Linksite — Shorten Links & Earn Money',
  description: 'Turn your links into a revenue stream. Share short links, get paid for every visitor. The most reliable link monetization platform on the web.',
  openGraph: {
    title: 'Linksite — Shorten Links & Earn Money',
    description: 'Turn your links into a revenue stream. Share short links, get paid for every visitor.',
  }
}

const features = [
  { icon: Zap, title: 'Instant Shortening', desc: 'Create short links in milliseconds with our lightning-fast infrastructure.' },
  { icon: BarChart3, title: 'Detailed Analytics', desc: 'Track clicks, countries, devices, and referrers in real-time.' },
  { icon: Globe, title: 'Global CDN', desc: 'Ultra-fast redirects served from data centers worldwide.' },
  { icon: Shield, title: 'Safe & Secure', desc: 'All URLs are scanned for malware and phishing threats automatically.' },
  { icon: Clock, title: 'Link Expiration', desc: 'Set expiry dates on your links for time-sensitive campaigns.' },
  { icon: TrendingUp, title: 'Earn Per Click', desc: 'Monetize every redirect and withdraw your earnings weekly.' },
]

const stats = [
  { value: '50M+', label: 'Links Shortened' },
  { value: '$2M+', label: 'Paid to Publishers' },
  { value: '120+', label: 'Countries' },
  { value: '99.9%', label: 'Uptime SLA' },
]

const testimonials = [
  { name: 'Alex Johnson', role: 'Content Creator', text: 'Linksite has been a game changer! I earn passive income from my blog links every day.', rating: 5 },
  { name: 'Sarah Williams', role: 'Digital Marketer', text: 'The analytics dashboard is stunning and the payouts are always on time. Love it!', rating: 5 },
  { name: 'Mike Chen', role: 'Affiliate Marketer', text: 'Best CPM rates I\'ve found. Withdrew my first payment within 2 weeks of signing up.', rating: 5 },
]

export default function HomePage() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="hero-bg relative min-h-[85vh] flex items-center justify-center py-24 px-4">
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 glass border border-primary/30 rounded-full px-4 py-1.5 text-sm text-muted-foreground mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Trusted by <strong className="text-foreground">50,000+</strong> publishers worldwide</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight font-display">
            Shorten Links &{' '}
            <span className="gradient-text">Earn Money</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Turn your links into a revenue stream. Share short links, get paid for every visitor.
            The most reliable link monetization platform on the web.
          </p>

          <ShortenForm />

          <p className="mt-4 text-xs text-muted-foreground">
            No account required • Free forever • Start earning in minutes
          </p>
        </div>

        {/* Live Particles Background */}
        <LiveBackground />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-10 w-64 h-64 rounded-full opacity-10 blur-3xl float-anim gradient-bg-primary text-primary-foreground" />
        <div className="absolute bottom-1/4 right-10 w-48 h-48 rounded-full opacity-10 blur-3xl float-anim orb-primary" style={{ animationDelay: '2s' }} />
      </section>

      {/* ─── Stats ─── */}
      <section className="py-16 px-4 border-y border-border/40">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="stat-card rounded-2xl p-6 text-center">
                <div className="text-3xl md:text-4xl font-black gradient-text mb-1 font-display">
                  {s.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4 font-display">
              Everything you need to{' '}
              <span className="gradient-text">succeed</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Packed with powerful features to maximize your earnings and grow your audience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title}
                className="glass rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 group">
                <div className="feature-icon w-12 h-12 mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="py-24 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4 font-display">
              Start earning in <span className="gradient-text">3 steps</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up for free and get instant access to all features.' },
              { step: '02', title: 'Shorten & Share', desc: 'Paste your long URL, get a short link, and share it anywhere.' },
              { step: '03', title: 'Earn & Withdraw', desc: 'Get paid for every visitor and withdraw directly to PayPal.' },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t border-dashed border-border/50" />
                )}
                <div className="w-16 h-16 rounded-2xl glass border border-primary/30 flex items-center justify-center mx-auto mb-4">
                  <span className="gradient-text font-black text-xl font-display">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4 font-display">
              Loved by <span className="gradient-text">creators</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <div key={t.name} className="glass rounded-2xl p-6 border border-border/50 hover:border-primary/20 transition-all">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="glass rounded-3xl p-12 text-center border border-primary/20 gradient-bg-card">
            <h2 className="text-3xl md:text-5xl font-black mb-4 font-display">
              Ready to start <span className="gradient-text">earning?</span>
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join 50,000+ publishers already making money with Linksite.
            </p>
            <Button asChild size="lg" className="btn-glow text-base px-8 h-14 rounded-xl gradient-bg-primary text-primary-foreground">
              <a href="/register">
                Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
