import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, Check, Star } from 'lucide-react'

export const metadata = { title: 'Admin — Plans' }

export default async function AdminPlansPage() {
  const plans = await prisma.plan.findMany({ orderBy: { price: 'asc' } })
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}><span className="gradient-text">Plans</span></h1>
        <p className="text-muted-foreground mt-1">Manage subscription plans</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map(plan => {
          const features: string[] = plan.features ? JSON.parse(plan.features) : []
          return (
            <Card key={plan.id} className={`glass border-border/50 ${plan.isDefault ? 'border-primary/30' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {plan.name} {plan.isDefault && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Default</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black gradient-text mb-4">{plan.price === 0 ? 'Free' : `$${plan.price}/mo`}</p>
                <ul className="space-y-2 mb-4">
                  {features.map((f, i) => <li key={i} className="flex items-center gap-2 text-sm"><Check className="w-3.5 h-3.5 text-primary" />{f}</li>)}
                </ul>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Timer: {plan.timer}s · Links: {plan.linksLimit === -1 ? '∞' : plan.linksLimit}</p>
                  <p>Direct: {plan.direct ? '✓' : '✗'} · No Ads: {plan.disableAds ? '✓' : '✗'} · No Captcha: {plan.disableCaptcha ? '✓' : '✗'}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
