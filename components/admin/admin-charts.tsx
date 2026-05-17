'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'
import { TrendingUp, Users, Eye, DollarSign } from 'lucide-react'

interface Props {
  dailyViews: { date: string; count: number }[]
  dailyRevenue: { date: string; amount: number }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-popover border border-border text-popover-foreground rounded-lg px-3 py-2 text-sm shadow-lg">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-bold text-primary">{payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export default function AdminCharts({ dailyViews, dailyRevenue }: Props) {
  const viewsData = dailyViews.slice(-14).map(d => ({ date: d.date.slice(5), count: d.count }))
  const revenueData = dailyRevenue.slice(-14).map(d => ({ date: d.date.slice(5), amount: d.amount }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Views Trend */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" /> Global Views Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={viewsData}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{fontSize: 10}} />
              <YAxis tick={{fontSize: 10}} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="var(--color-chart-1)" fillOpacity={1} fill="url(#viewsGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue Trend */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" /> Revenue (USD)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{fontSize: 10}} />
              <YAxis tick={{fontSize: 10}} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
