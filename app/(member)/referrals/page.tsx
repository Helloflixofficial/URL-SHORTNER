import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, DollarSign, TrendingUp, Copy, Share2, Info } from 'lucide-react'
import { getOption } from '@/lib/options'
import ReferralLinkCard from '@/components/member/referral-link-card'

export const metadata = { title: 'Referrals' }

export default async function ReferralsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const userId = session.user.id!

  const [user, refPercentRaw] = await Promise.all([
    prisma.user.findUnique({ 
      where: { id: userId }, 
      select: { id: true, referralEarnings: true, referredCount: true } 
    }),
    getOption('referral_percentage', '20'),
  ])

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const referralLink = `${baseUrl}/register?ref=${userId}`
  const refPercent = refPercentRaw

  const stats = [
    { label: 'Total Referrals', value: user?.referredCount ?? 0, icon: Users, chipClass: 'icon-chip-purple' },
    { label: 'Referral Earnings', value: `$${(user?.referralEarnings ?? 0).toFixed(4)}`, icon: DollarSign, chipClass: 'icon-chip-green' },
    { label: 'Commission Rate', value: `${refPercent}%`, icon: TrendingUp, chipClass: 'icon-chip-amber' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black font-display">
          <span className="gradient-text">Referrals</span>
        </h1>
        <p className="text-muted-foreground mt-1">Invite your friends and earn for lifetime</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((s) => (
          <Card key={s.label} className="glass border-border/50 stat-card">
            <CardContent className="pt-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-white/5 border border-white/10">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-black font-display">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ReferralLinkCard referralLink={referralLink} />

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" /> How it works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">1</div>
                <p className="text-sm text-muted-foreground">Share your unique referral link with your friends or audience.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">2</div>
                <p className="text-sm text-muted-foreground">When they sign up, they become your referrals for lifetime.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">3</div>
                <p className="text-sm text-muted-foreground">You will earn <span className="text-foreground font-bold">{refPercent}%</span> of their earnings automatically.</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 mt-4">
              <p className="text-xs leading-relaxed">
                <strong className="text-primary">Tip:</strong> The more high-quality publishers you refer, the more passive income you generate. There is no limit on how much you can earn!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Referral FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h4 className="font-bold text-sm">When do I get paid?</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Referral commissions are added to your balance in real-time as your referrals earn money. You can withdraw this money along with your regular earnings.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-sm">Is there a limit?</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Absolutely not! You can refer as many people as you want. The more active your referrals are, the more you earn.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
