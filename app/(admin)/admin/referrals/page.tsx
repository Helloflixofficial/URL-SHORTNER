import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Users, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export const metadata = { title: 'Referrals' }

export default async function AdminReferralsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams
  const page = parseInt(params.page || '1') || 1
  const pageSize = 20

  const [total, referrals] = await Promise.all([
    prisma.user.count({ where: { referralId: { not: null } } }),
    prisma.user.findMany({
      where: { referralId: { not: null } },
      include: { referrer: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center gradient-bg-primary">
          <UserCheck className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-black font-display">
            Platform <span className="gradient-text">Referrals</span>
          </h1>
          <p className="text-muted-foreground mt-1">Overview of all referred users</p>
        </div>
      </div>

      <Card className="glass border-border/50">
        <CardHeader className="pb-3 border-b border-border/30">
          <CardTitle className="text-base font-bold">Referral Log</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 bg-muted/20">
                  <TableHead>Referred User</TableHead>
                  <TableHead>Referred By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No referrals found
                    </TableCell>
                  </TableRow>
                ) : referrals.map((u) => (
                  <TableRow key={u.id} className="border-border/30 table-row-hover">
                    <TableCell>
                      <Link href={`/admin/users/${u.id}`} className="font-medium hover:text-primary transition-colors">
                        {u.username}
                      </Link>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </TableCell>
                    <TableCell>
                      {u.referrer ? (
                        <Link href={`/admin/users/${u.referralId}`} className="font-medium hover:text-primary transition-colors">
                          {u.referrer.username}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground italic">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${
                        u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                        u.status === 'banned' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {u.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} asChild className="glass">
                  <Link href={`/admin/referrals?page=${page - 1}`}><ChevronLeft className="w-4 h-4" /></Link>
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} asChild className="glass">
                  <Link href={`/admin/referrals?page=${page + 1}`}><ChevronRight className="w-4 h-4" /></Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
