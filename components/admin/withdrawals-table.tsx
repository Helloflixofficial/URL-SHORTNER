'use client'
import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, CheckSquare, MoreHorizontal, Filter } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface W { id: string; amount: number; method: string; status: number; accountDetails: string; createdAt: Date; user: { username: string; email: string } }
interface Props { withdrawals: W[]; total: number; page: number; pageSize: number }

const STATUS = { 
  0: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-400/10' }, 
  1: { label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-400/10' }, 
  2: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-400/10' } 
}

export default function AdminWithdrawalsTable({ withdrawals, total, page, pageSize }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startT] = useTransition()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const totalPages = Math.ceil(total / pageSize)

  const currentStatus = searchParams.get('status')

  const filterStatus = (status: string | null) => {
    startT(() => {
      const p = new URLSearchParams()
      if (status !== null) p.set('status', status)
      p.set('page', '1')
      router.push(`/admin/withdrawals?${p}`)
    })
  }

  const updateStatus = async (id: string, status: number) => {
    if (!confirm(`Are you sure you want to ${status === 1 ? 'approve' : 'reject'} this withdrawal?`)) return
    const res = await fetch('/api/admin/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) { toast.success(status === 1 ? 'Withdrawal approved' : 'Withdrawal rejected'); router.refresh() }
    else toast.error('Failed to update')
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    // Only select pending items for mass action
    const pendingIds = withdrawals.filter(w => w.status === 0).map(w => w.id)
    if (pendingIds.length === 0) return
    if (selectedIds.size === pendingIds.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(pendingIds))
  }

  const massAction = async (action: 'approve' | 'reject') => {
    if (selectedIds.size === 0) return toast.error('No pending withdrawals selected')
    if (!confirm(`Are you sure you want to ${action} selected withdrawals?`)) return
    
    const res = await fetch('/api/admin/withdrawals/mass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ids: Array.from(selectedIds) })
    })

    if (res.ok) {
      toast.success(`Withdrawals ${action}d successfully`)
      setSelectedIds(new Set())
      router.refresh()
    } else {
      toast.error('Mass action failed')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="glass pl-3 pr-4">
                <Filter className="w-4 h-4 mr-2" /> 
                {currentStatus === '0' ? 'Pending' : currentStatus === '1' ? 'Approved' : currentStatus === '2' ? 'Rejected' : 'All Statuses'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="glass border-border">
              <DropdownMenuItem onClick={() => filterStatus(null)}>All Statuses</DropdownMenuItem>
              <DropdownMenuItem onClick={() => filterStatus('0')}>Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => filterStatus('1')}>Approved</DropdownMenuItem>
              <DropdownMenuItem onClick={() => filterStatus('2')}>Rejected</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <Button variant="outline" size="sm" className="glass text-xs" onClick={() => massAction('approve')}>
                <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Approve Selected
              </Button>
              <Button variant="outline" size="sm" className="glass text-xs text-red-400 border-red-500/30" onClick={() => massAction('reject')}>
                <XCircle className="w-3.5 h-3.5 mr-1 text-red-400" /> Reject Selected
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl border border-border/50 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 bg-muted/20 hover:bg-muted/20">
              <TableHead className="w-10">
                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={toggleSelectAll}>
                  <CheckSquare className={`w-4 h-4 ${selectedIds.size > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                </Button>
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No withdrawals match your criteria</TableCell></TableRow>
            ) : withdrawals.map((w) => {
              const s = STATUS[w.status as keyof typeof STATUS] ?? STATUS[0]
              const isPending = w.status === 0
              return (
                <TableRow key={w.id} className="border-border/30 table-row-hover group">
                  <TableCell>
                    {isPending ? (
                      <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => toggleSelect(w.id)}>
                        <CheckSquare className={`w-4 h-4 ${selectedIds.has(w.id) ? 'text-primary' : 'text-muted-foreground opacity-30 group-hover:opacity-100'}`} />
                      </Button>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{w.user.username}</p>
                    <p className="text-xs text-muted-foreground">{w.user.email}</p>
                  </TableCell>
                  <TableCell><span className="font-bold text-emerald-400">${w.amount.toFixed(2)}</span></TableCell>
                  <TableCell><span className="capitalize text-sm font-medium">{w.method.replace('_', ' ')}</span></TableCell>
                  <TableCell><span className="text-xs text-muted-foreground truncate block max-w-[140px] font-mono">{w.accountDetails}</span></TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>
                      {s.label}
                    </span>
                  </TableCell>
                  <TableCell><span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(w.createdAt), { addSuffix: true })}</span></TableCell>
                  <TableCell>
                    {isPending && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass border-border">
                          <DropdownMenuItem className="text-emerald-400 cursor-pointer" onClick={() => updateStatus(w.id, 1)}><CheckCircle className="w-3.5 h-3.5 mr-2" />Approve</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 cursor-pointer" onClick={() => updateStatus(w.id, 2)}><XCircle className="w-3.5 h-3.5 mr-2" />Reject</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages} — {total} total</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} asChild className="glass border-border/50">
              <Link href={`/admin/withdrawals?page=${page - 1}${currentStatus ? `&status=${currentStatus}` : ''}`}><ChevronLeft className="w-4 h-4" /></Link>
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} asChild className="glass border-border/50">
              <Link href={`/admin/withdrawals?page=${page + 1}${currentStatus ? `&status=${currentStatus}` : ''}`}><ChevronRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
