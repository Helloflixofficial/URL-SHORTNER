'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts'
import { TrendingUp, Globe, MousePointer2, DollarSign, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export default function StatisticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/member/stats')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-black font-display">
          Advanced <span className="gradient-text">Statistics</span>
        </h1>
        <p className="text-muted-foreground mt-1">Deep dive into your performance data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-border/50 stat-card group">
          <CardContent className="pt-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-primary/10 group-hover:scale-110 transition-transform">
              <MousePointer2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-3xl font-black">{data.totals.views.toLocaleString()}</h3>
            <p className="text-xs text-muted-foreground font-bold uppercase mt-1">Total Views</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50 stat-card group">
          <CardContent className="pt-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-emerald-500/10 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-3xl font-black">${data.totals.earnings.toFixed(4)}</h3>
            <p className="text-xs text-muted-foreground font-bold uppercase mt-1">Total Earnings</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50 stat-card group">
          <CardContent className="pt-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-amber-500/10 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-3xl font-black">${(data.totals.earnings / (data.totals.views || 1) * 1000).toFixed(2)}</h3>
            <p className="text-xs text-muted-foreground font-bold uppercase mt-1">Average CPM</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-border/50 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Last 30 Days Views
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <div className="h-[300px] w-full pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData}>
                  <defs>
                    <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#ffffff30" 
                    fontSize={10} 
                    tickFormatter={(val) => format(new Date(val), 'MMM d')}
                  />
                  <YAxis stroke="#ffffff30" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#viewGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-500" /> Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-[250px] w-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.countryStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.countryStats.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3 w-full">
              {data.countryStats.slice(0, 5).map((c: any, i: number) => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-sm font-medium">{c.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{((c.value / data.totals.views) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
