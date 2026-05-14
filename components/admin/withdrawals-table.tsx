'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface W { id: string; amount: number; method: string; status: number; accountDetails: string; createdAt: Date; user: { username: string; email: string } }
interface Props { withdrawals: W[]; total: number; page: number; pageSize: number }

const STATUS = { 0: { label: 'Pending', color: 'text-amber-400' }, 1: { label: 'Approved', color: 'text-emerald-400' }, 2: { label: 'Rejected', color: 'text-red-400' } }

export default function AdminWithdrawalsTable({ withdrawals, total, page, pageSize }: Props) {
  const router = useRouter()
  const totalPages = Math.ceil(total / pageSize)

  const updateStatus = async (id: string, status: number) => {
    const res = await fetch(`/api/admin/withdrawals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) { toast.success(status === 1 ? 'Withdrawal approved' : 'Withdrawal rejected'); router.refresh() }
    else toast.error('Failed to update')
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl border border-border/50 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30">
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No withdrawals</TableCell></TableRow>
            ) : withdrawals.map((w) => {
              const s = STATUS[w.status as keyof typeof STATUS] ?? STATUS[0]
              return (
                <TableRow key={w.id} className="border-border/30 table-row-hover">
                  <TableCell>
                    <p className="text-sm font-medium">{w.user.username}</p>
                    <p className="text-xs text-muted-foreground">{w.user.email}</p>
                  </TableCell>
                  <TableCell><span className="font-bold text-emerald-400">${w.amount.toFixed(2)}</span></TableCell>
                  <TableCell><span className="capitalize text-sm">{w.method}</span></TableCell>
                  <TableCell><span className="text-xs text-muted-foreground truncate block max-w-[140px]">{w.accountDetails}</span></TableCell>
                  <TableCell><span className={`text-xs font-semibold ${s.color}`}>{s.label}</span></TableCell>
                  <TableCell><span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(w.createdAt), { addSuffix: true })}</span></TableCell>
                  <TableCell>
                    {w.status === 0 && (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-400 hover:text-emerald-300" onClick={() => updateStatus(w.id, 1)}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => updateStatus(w.id, 2)}>
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} asChild>
              <Link href={`/admin/withdrawals?page=${page - 1}`}><ChevronLeft className="w-4 h-4" /></Link>
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} asChild>
              <Link href={`/admin/withdrawals?page=${page + 1}`}><ChevronRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
