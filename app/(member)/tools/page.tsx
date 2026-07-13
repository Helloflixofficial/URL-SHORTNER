import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Zap, Copy, Code, ListFilter, ShieldCheck } from 'lucide-react'
import ToolsClient from '@/components/member/tools-client'

export const metadata = { title: 'Publisher Tools' }

export default async function ToolsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const userId = session.user.id!

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { apiToken: true }
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const apiToken = user?.apiToken ?? 'PLEASE_REFRESH'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black font-display">
          Publisher <span className="gradient-text">Tools</span>
        </h1>
        <p className="text-muted-foreground mt-1">Automate your shortening process with our developer tools</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Quick Link */}
        <Card className="glass border-border/50">
          <CardHeader className="bg-primary/5 pb-6">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" /> Quick Link
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The fastest way to shorten links. Just append your URL to the end of the API endpoint.
            </p>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 font-mono text-xs break-all">
              {baseUrl}/st?api=<span className="text-primary font-bold">{apiToken}</span>&url=https://google.com
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Your API Token is private. Do not share it with others.</span>
            </div>
          </CardContent>
        </Card>

        <ToolsClient apiToken={apiToken} baseUrl={baseUrl} />
      </div>
    </div>
  )
}
