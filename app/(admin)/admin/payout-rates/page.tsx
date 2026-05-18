import { prisma } from '@/lib/prisma'
import PayoutRatesEditor from '@/components/admin/payout-rates-editor'

export const metadata = { title: 'Payout Rates' }

export default async function AdminPayoutRatesPage() {
  const options = await prisma.option.findMany({
    where: {
      key: { in: ['payout_rates_interstitial', 'payout_rates_banner', 'payout_rates_popup'] }
    }
  })

  const getRates = (key: string) => {
    const opt = options.find(o => o.key === key)
    if (!opt?.value) return { all: { '1': 0, '2': 0, '3': 0 } }
    try { return JSON.parse(opt.value) } catch { return { all: { '1': 0, '2': 0, '3': 0 } } }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-display">
          Payout <span className="gradient-text">Rates</span>
        </h1>
        <p className="text-muted-foreground mt-1">Manage CPM rates (Cost Per Mille) by country and ad type.</p>
      </div>
      
      <PayoutRatesEditor 
        interstitial={getRates('payout_rates_interstitial')}
        banner={getRates('payout_rates_banner')}
        popup={getRates('payout_rates_popup')}
      />
    </div>
  )
}
