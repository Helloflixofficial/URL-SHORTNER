import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users } from 'lucide-react'
import AdminCharts from '@/components/admin/admin-charts'
import MonthSelector from '@/components/shared/month-selector'

export const metadata = { title: 'Statistics' }

export default async function MemberStatisticsPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const userId = session.user.id!
  
  const params = await searchParams
  
  // Default to current month if no month is provided
  const now = new Date()
  let targetYear = now.getFullYear()
  let targetMonth = now.getMonth() + 1 // 1-12

  if (params.month) {
    const [y, m] = params.month.split('-')
    if (y && m) {
      targetYear = parseInt(y)
      targetMonth = parseInt(m)
    }
  }

  const startDate = new Date(targetYear, targetMonth - 1, 1)
  const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999)

  const rawDailyStats = await prisma.statistic.findMany({
    where: {
      userId,
      reason: 1,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: { createdAt: true, publisherPrice: true },
  })

  // We could also fetch referral earnings from withdrawal transactions or specifically tracked stats.
  // For simplicity matching the db schema, we'll assume member referral earnings are tracked somehow, 
  // but if not, we leave it as a placeholder.
  
  // Build chart data
  const viewMap: Record<string, number> = {}
  const pubMap: Record<string, number> = {}

  // Initialize all days of the month
  const numDays = endDate.getDate()
  for (let i = 1; i <= numDays; i++) {
    const dStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    viewMap[dStr] = 0
    pubMap[dStr] = 0
  }

  let totalViews = 0
  let totalPublisher = 0

  rawDailyStats.forEach(s => {
    const day = s.createdAt.toISOString().split('T')[0]
    if (viewMap[day] !== undefined) {
      viewMap[day] += 1
      pubMap[day] += s.publisherPrice || 0
      
      totalViews++
      totalPublisher += s.publisherPrice || 0
    }
  })

  const dailyViews = Object.entries(viewMap).map(([date, count]) => ({ date, count }))
  const dailyRevenue = Object.entries(pubMap).map(([date, amount]) => ({ date, amount }))

  // Generate last 12 months for selector
  const months = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('default', { month: 'long', year: 'numeric' })
    })
  }
  const currentMonthStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}`

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-display">
            My <span className="gradient-text">Statistics</span>
          </h1>
          <p className="text-muted-foreground mt-1">Detailed breakdown of your earnings and clicks</p>
        </div>
        
        {/* Month selector */}
        <MonthSelector months={months} currentMonthStr={currentMonthStr} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="glass border-border/50 stat-card">
          <CardContent className="pt-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 icon-chip-purple">
              <BarChart3 className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black font-display">{totalViews.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Clicks</p>
          </CardContent>
        </Card>
        
        <Card className="glass border-border/50 stat-card">
          <CardContent className="pt-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 icon-chip-amber">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black font-display text-emerald-400">${totalPublisher.toFixed(4)}</p>
            <p className="text-sm text-muted-foreground mt-1">Link Earnings</p>
          </CardContent>
        </Card>
        
        <Card className="glass border-border/50 stat-card">
          <CardContent className="pt-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 icon-chip-green">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black font-display text-primary">$0.0000</p>
            <p className="text-sm text-muted-foreground mt-1">Referral Earnings (Month)</p>
          </CardContent>
        </Card>
      </div>

      <AdminCharts dailyViews={dailyViews} dailyRevenue={dailyRevenue} />
    </div>
  )
}
