import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PayoutRatesEditor from '@/components/admin/payout-rates-editor'
import { TrendingUp } from 'lucide-react'

export const metadata = { title: 'Manage Payout Rates — Admin' }

export default async function AdminPayoutRatesPage() {
  const ratesOption = await prisma.option.findUnique({ where: { key: 'payout_rates_interstitial' } })
  let initialRates = {}
  try {
    initialRates = JSON.parse(ratesOption?.value || '{}')
  } catch (e) {
    console.error('Failed to parse payout rates', e)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-display">
          Payout <span className="gradient-text">Rates</span>
        </h1>
        <p className="text-muted-foreground mt-1">Configure CPM rates for your publishers</p>
      </div>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Interstitial Ads (CPM)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PayoutRatesEditor initialRates={initialRates} />
        </CardContent>
      </Card>
    </div>
  )
}
