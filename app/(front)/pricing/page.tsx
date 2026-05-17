import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Zap, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = { title: 'Pricing — Linksite' }

export default async function PricingPage() {
  const plans = await prisma.plan.findMany({ orderBy: { price: 'asc' } })

  const icons = [Zap, Star, Star]
  const highlights = [false, true, false]

  return (
    <div className="py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black mb-4 font-display">
            Simple, transparent <span className="gradient-text">pricing</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const isFeatured = highlights[i] ?? false
            const features: string[] = plan.features ? JSON.parse(plan.features) : []
            const Icon = icons[i] ?? Zap

            return (
              <div key={plan.id}
                className={`rounded-3xl p-8 border transition-all ${isFeatured ? 'pricing-featured' : 'glass border-border/50 hover:border-primary/20'}`}>
                {isFeatured && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 rounded-full px-3 py-1 mb-4">
                    <Star className="w-3 h-3 fill-current" /> Most Popular
                  </div>
                )}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 feature-icon">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-black mb-1 font-display">{plan.name}</h2>
                <div className="mb-6">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-black gradient-text">Free</span>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-black gradient-text">${plan.price}</span>
                      <span className="text-muted-foreground mb-1">/month</span>
                    </div>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2.5 text-sm">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-primary/20">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className={`w-full h-11 rounded-xl font-semibold ${isFeatured ? 'btn-glow' : ''}`}
                  style={isFeatured ? { background: 'var(--gradient-primary)' } : undefined}
                  variant={isFeatured ? 'default' : 'outline'}>
                  <Link href="/register">
                    {plan.price === 0 ? 'Get Started Free' : `Get ${plan.name}`}
                  </Link>
                </Button>
              </div>
            )
          })}
        </div>

        <div className="mt-16 glass rounded-2xl p-8 border border-border/50 text-center">
          <h3 className="text-xl font-bold mb-2">Need a custom plan?</h3>
          <p className="text-muted-foreground mb-4">We offer custom solutions for high-volume publishers and enterprises.</p>
          <Button asChild variant="outline">
            <Link href="/contact">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
