import { getOption } from '@/lib/options'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, Monitor, Smartphone, Zap } from 'lucide-react'

export const metadata = { title: 'Payout Rates — Linksite' }

export default async function PayoutRatesPage() {
  const ratesJson = await getOption('payout_rates_interstitial', '{}')
  let rates: Record<string, { desktop: number; mobile: number }> = {}
  try {
    const raw = JSON.parse(ratesJson)
    // Support both {US: {desktop: 10}} and {US: {2: 0.01}} (CPM conversion)
    Object.entries(raw).forEach(([country, val]: [string, any]) => {
      const desktop = val.desktop ?? (val['2'] ? val['2'] * 1000 : 0)
      const mobile = val.mobile ?? (val['3'] ? val['3'] * 1000 : 0)
      rates[country] = { desktop, mobile }
    })
  } catch (e) {
    console.error('Failed to parse payout rates', e)
  }

  // Default rates if empty
  if (Object.keys(rates).length === 0) {
    rates = {
      'United States': { desktop: 10.0, mobile: 12.0 },
      'United Kingdom': { desktop: 8.0, mobile: 9.0 },
      'Canada': { desktop: 7.5, mobile: 8.5 },
      'Australia': { desktop: 7.0, mobile: 8.0 },
      'Germany': { desktop: 6.5, mobile: 7.5 },
      'Others': { desktop: 3.5, mobile: 3.5 }
    }
  }

  const sortedCountries = Object.entries(rates).sort((a, b) => b[1].desktop - a[1].desktop)

  return (
    <div className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black mb-4 font-display">
            Earn the <span className="gradient-text">Highest Rates</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            We offer competitive CPM rates for all countries. Check how much you can earn per 1,000 views.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Interstitial Ad</CardTitle>
                <p className="text-xs text-muted-foreground">Full page ad with timer</p>
              </div>
            </CardHeader>
          </Card>
          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Monitor className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Banner Ad</CardTitle>
                <p className="text-xs text-muted-foreground">Simple banner on top</p>
              </div>
            </CardHeader>
          </Card>
        </div>

        <Card className="glass border-border/50 overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" /> CPM Rates per Country
              </CardTitle>
              <div className="flex gap-4 text-xs font-bold uppercase text-muted-foreground">
                <span className="flex items-center gap-1"><Monitor className="w-3 h-3" /> Desktop</span>
                <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> Mobile</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30">
              {sortedCountries.map(([country, val]) => (
                <div key={country} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{country}</span>
                  </div>
                  <div className="flex gap-8">
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">${val.desktop.toFixed(2)}</p>
                    </div>
                    <div className="text-right w-16">
                      <p className="text-sm font-black text-primary">${val.mobile.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm mb-6">
            Rates are subject to change based on advertiser demand and traffic quality.
          </p>
          <Card className="glass border-border/50 p-6 inline-block">
            <p className="text-sm font-bold mb-2">Ready to start earning?</p>
            <a href="/register" className="text-primary hover:underline font-black text-lg">Create your free account today →</a>
          </Card>
        </div>
      </div>
    </div>
  )
}
