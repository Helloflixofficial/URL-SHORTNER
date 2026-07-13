import ShortenForm from '@/components/front/shorten-form'
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

export default function HomePage() {
  return (
    <section className="hero-bg relative w-full flex items-center justify-center py-6 md:py-12 px-4 overflow-hidden min-h-[calc(100vh-56px)]">
      <div className="relative z-10 text-center max-w-4xl mx-auto w-full">
        {/* <div className="inline-flex items-center gap-2 glass border border-primary/30 rounded-full px-4 py-1.5 text-xs md:text-sm text-muted-foreground mb-4 md:mb-6"> */}
        {/* <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> */}
        {/* <span>Trusted by <strong className="text-foreground">50,000+</strong> publishers worldwide</span> */}
        {/* </div> */}

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight font-display">
          Shorten Links &{' '}
          <span className="gradient-text">Earn Money</span>
        </h1>

        <p className="text-sm md:text-base lg:text-lg text-muted-foreground mb-6 md:mb-8 max-w-xl md:max-w-2xl mx-auto leading-relaxed">
          Turn your links into a revenue stream. Share short links, get paid for every visitor.
          The most reliable link monetization platform on the web.
        </p>

        <ShortenForm />

        <p className="mt-3 text-[10px] md:text-xs text-muted-foreground">
          No account required • Free forever • Start earning in minutes
        </p>
      </div>

      {/* Live Particles Background */}
      <LiveBackground />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-10 w-64 h-64 rounded-full opacity-10 blur-3xl float-anim gradient-bg-primary text-primary-foreground" />
      <div className="absolute bottom-1/4 right-10 w-48 h-48 rounded-full opacity-10 blur-3xl float-anim orb-primary" style={{ animationDelay: '2s' }} />
    </section>
  )
}
