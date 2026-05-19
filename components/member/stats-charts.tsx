'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { BarChart3, Globe, Monitor } from 'lucide-react'

interface Props {
  countryStats: { country: string; count: number }[]
  deviceStats: { device: number; count: number }[]
  dailyStats: { date: string; count: number }[]
}

const CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'hsl(270 70% 60%)',
  'hsl(330 80% 60%)',
]

const deviceLabel = (d: number) => ({ 2: 'Desktop', 3: 'Mobile/Tablet', 1: 'All' }[d] ?? 'Unknown')

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-popover border border-border text-popover-foreground rounded-lg px-3 py-2 text-sm shadow-lg">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-bold text-primary">{payload[0].value.toLocaleString()} views</p>
      </div>
    )
  }
  return null
}

export default function StatsCharts({ countryStats, deviceStats, dailyStats }: Props) {
  const deviceData = deviceStats.map(d => ({ name: deviceLabel(d.device), value: d.count }))
  
  // Group daily stats by date
  const grouped: Record<string, number> = {}
  for (const s of dailyStats) {
    grouped[s.date] = (grouped[s.date] ?? 0) + s.count
  }
  const chartData = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, count]) => ({ date: date.slice(5), count }))

  return (
    <div className="space-y-6">
      {/* Daily chart */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-4 h-4 text-primary" /> Views — Last 30 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[180px] sm:h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} width={32} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="url(#chartGrad)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" />
                    <stop offset="100%" stopColor="var(--color-chart-2)" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Countries */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="w-4 h-4 text-primary" /> Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {countryStats.slice(0, 8).map((c, i) => (
                <div key={c.country} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <span className="text-sm flex-1 font-medium">{c.country}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full gradient-bg-primary"
                      style={{ width: `${(c.count / (countryStats[0]?.count ?? 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">{c.count}</span>
                </div>
              ))}
              {countryStats.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>}
            </div>
          </CardContent>
        </Card>

        {/* Devices */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Monitor className="w-4 h-4 text-primary" /> Device Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={deviceData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                    dataKey="value" nameKey="name">
                    {deviceData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Legend formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-popover)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '0.5rem',
                      color: 'var(--color-popover-foreground)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
