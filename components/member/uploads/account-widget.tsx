'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { HardDrive, DollarSign, BarChart3, Download, Eye, Wifi } from 'lucide-react'

interface AccountInfo {
  email: string
  balance: string
  storage_used: string
  premium_expire: string
  storage_left: string
}
interface AccountStats {
  downloads: string
  views: string
  profit_total: string
  refs: string
}

export default function AccountWidget() {
  const [info, setInfo] = useState<AccountInfo | null>(null)
  const [stats, setStats] = useState<AccountStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/uploads/account')
      .then((r) => r.json())
      .then((d) => {
        if (d.info?.result) setInfo(d.info.result)
        if (d.stats?.result?.[0]) setStats(d.stats.result[0])
      })
      .catch(() => {}) // Error already logged server-side
      .finally(() => setLoading(false))
  }, [])

  function formatBytes(bytes: string) {
    const n = parseInt(bytes)
    if (isNaN(n)) return bytes
    if (n >= 1073741824) return `${(n / 1073741824).toFixed(2)} GB`
    if (n >= 1048576) return `${(n / 1048576).toFixed(2)} MB`
    if (n >= 1024) return `${(n / 1024).toFixed(2)} KB`
    return `${n} B`
  }

  const widgets = [
    {
      icon: HardDrive,
      label: 'Storage Used',
      value: info ? formatBytes(info.storage_used) : '—',
      sub: info?.storage_left === 'inf' ? 'Unlimited remaining' : info ? `${formatBytes(info.storage_left)} left` : '',
      color: 'icon-chip-cyan',
    },
    {
      icon: DollarSign,
      label: 'DN Balance',
      value: info ? `$${parseFloat(info.balance).toFixed(5)}` : '—',
      sub: 'DataNodes account',
      color: 'icon-chip-amber',
    },
    {
      icon: Download,
      label: 'Total Downloads',
      value: stats ? parseInt(stats.downloads).toLocaleString() : '—',
      sub: 'All time',
      color: 'icon-chip-purple',
    },
    {
      icon: Eye,
      label: 'Total Views',
      value: stats ? parseInt(stats.views).toLocaleString() : '—',
      sub: 'All time',
      color: 'icon-chip-green',
    },
    {
      icon: BarChart3,
      label: 'DN Earnings',
      value: stats ? `$${parseFloat(stats.profit_total).toFixed(5)}` : '—',
      sub: 'DataNodes total',
      color: 'icon-chip-cyan',
    },
    {
      icon: Wifi,
      label: 'Premium Until',
      value: info?.premium_expire ? info.premium_expire.split(' ')[0] : '—',
      sub: 'DataNodes premium',
      color: 'icon-chip-amber',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {widgets.map((w) => (
        <Card key={w.label} className="glass border-border/50 hover:border-primary/20 transition-all">
          <CardContent className="pt-5 pb-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${w.color}`}>
              <w.icon className="w-4 h-4" />
            </div>
            {loading ? (
              <>
                <div className="h-6 w-16 bg-muted/40 rounded animate-pulse mb-1" />
                <div className="h-3 w-12 bg-muted/30 rounded animate-pulse" />
              </>
            ) : (
              <>
                <p className="text-lg font-black font-display leading-tight">{w.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{w.label}</p>
                {w.sub && <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">{w.sub}</p>}
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
