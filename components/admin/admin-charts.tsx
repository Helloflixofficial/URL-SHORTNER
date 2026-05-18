'use client'
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react'

interface DailyView { date: string; count: number }
interface DailyRevenue { date: string; amount: number }
interface DailyBreakdown { date: string; publisher: number; owner: number; referral: number }

interface Props {
  dailyViews: DailyView[]
  dailyRevenue: DailyRevenue[]
  dailyBreakdown?: DailyBreakdown[]
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass border border-border/50 rounded-xl p-3 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-semibold text-foreground">
            {typeof p.value === 'number' && p.name.toLowerCase().includes('earn') ? `$${p.value.toFixed(4)}` : p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

const fmtDate = (d: string) => {
  const parts = d.split('-')
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : d
}

export default function AdminCharts({ dailyViews, dailyRevenue, dailyBreakdown }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Views chart */}
      <Card className="glass border-border/50 lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center icon-chip-purple">
              <BarChart3 className="w-3.5 h-3.5" />
            </span>
            Daily Clicks (30 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyViews.map(d => ({ ...d, date: fmtDate(d.date) }))} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(262,80%,60%)" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="hsl(193,100%,50%)" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(215,20%,55%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215,20%,55%)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="url(#clicksGrad)" radius={[4, 4, 0, 0]} name="clicks" maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue chart */}
      <Card className="glass border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center icon-chip-amber">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
            Daily Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyRevenue.map(d => ({ ...d, date: fmtDate(d.date) }))} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38,92%,50%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(38,92%,50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(215,20%,55%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215,20%,55%)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="hsl(38,92%,50%)"
                strokeWidth={2}
                fill="url(#revenueGrad)"
                name="earnings"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue breakdown (stacked area) */}
      {dailyBreakdown && dailyBreakdown.length > 0 && (
        <Card className="glass border-border/50 lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center icon-chip-green">
                <DollarSign className="w-3.5 h-3.5" />
              </span>
              Revenue Breakdown — Publisher · Owner · Referral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyBreakdown.map(d => ({ ...d, date: fmtDate(d.date) }))} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pubGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(262,80%,60%)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="hsl(262,80%,60%)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="ownGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(193,100%,50%)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="hsl(193,100%,50%)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="refGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(152,76%,47%)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="hsl(152,76%,47%)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,17%)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(215,20%,55%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215,20%,55%)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'hsl(215,20%,55%)' }} />
                <Area type="monotone" dataKey="publisher" stackId="1" stroke="hsl(262,80%,60%)" fill="url(#pubGrad)" strokeWidth={2} name="publisher earnings" />
                <Area type="monotone" dataKey="owner" stackId="1" stroke="hsl(193,100%,50%)" fill="url(#ownGrad)" strokeWidth={2} name="owner earnings" />
                <Area type="monotone" dataKey="referral" stackId="1" stroke="hsl(152,76%,47%)" fill="url(#refGrad)" strokeWidth={2} name="referral earnings" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
