'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, MoreHorizontal, ChevronLeft, ChevronRight, Shield, Ban, CheckCircle, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface UserRow {
  id: string; username: string; email: string; role: string; status: string
  balance: number; totalEarned: number; createdAt: Date
}
interface Props { users: UserRow[]; total: number; page: number; pageSize: number; searchQuery: string }

const statusColor = (s: string) => s === 'active' ? 'text-emerald-400' : s === 'banned' ? 'text-red-400' : 'text-amber-400'

export default function AdminUsersTable({ users, total, page, pageSize, searchQuery }: Props) {
  const router = useRouter()
  const [q, setQ] = useState(searchQuery)
  const [, startT] = useTransition()
  const totalPages = Math.ceil(total / pageSize)

  const search = (v: string) => {
    setQ(v)
    startT(() => {
      const p = new URLSearchParams()
      if (v) p.set('q', v)
      p.set('page', '1')
      router.push(`/admin/users?${p}`)
    })
  }

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    if (res.ok) { toast.success('User updated'); router.refresh() }
    else toast.error('Failed')
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={q} onChange={e => search(e.target.value)} placeholder="Search users..." className="pl-9 glass border-border/50" />
      </div>
      <div className="glass rounded-2xl border border-border/50 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30">
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead className="hidden md:table-cell">Total Earned</TableHead>
              <TableHead className="hidden lg:table-cell">Joined</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} className="border-border/30 table-row-hover">
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{u.username}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground'}`}>
                    {u.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold capitalize ${statusColor(u.status)}`}>{u.status}</span>
                </TableCell>
                <TableCell><span className="font-semibold">${u.balance.toFixed(2)}</span></TableCell>
                <TableCell className="hidden md:table-cell">${u.totalEarned.toFixed(2)}</TableCell>
                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass border-border">
                      <DropdownMenuItem onClick={() => {
                        const amount = prompt('Enter new balance:', u.balance.toString())
                        if (amount !== null) {
                          const val = parseFloat(amount)
                          if (!isNaN(val)) {
                            fetch(`/api/admin/users/${u.id}`, { 
                              method: 'PATCH', 
                              headers: { 'Content-Type': 'application/json' }, 
                              body: JSON.stringify({ balance: val }) 
                            }).then(res => {
                              if (res.ok) { toast.success('Balance updated'); router.refresh() }
                              else toast.error('Failed')
                            })
                          }
                        }
                      }}>
                        <DollarSign className="w-3.5 h-3.5 mr-2 text-primary" />Edit Balance
                      </DropdownMenuItem>
                      {u.status !== 'active' && (
                        <DropdownMenuItem onClick={() => updateStatus(u.id, 'active')}>
                          <CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-400" />Activate
                        </DropdownMenuItem>
                      )}
                      {u.status !== 'banned' && u.role !== 'admin' && (
                        <DropdownMenuItem className="text-destructive" onClick={() => updateStatus(u.id, 'banned')}>
                          <Ban className="w-3.5 h-3.5 mr-2" />Ban User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages} — {total} total</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} asChild>
              <Link href={`/admin/users?page=${page - 1}${q ? `&q=${q}` : ''}`}><ChevronLeft className="w-4 h-4" /></Link>
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} asChild>
              <Link href={`/admin/users?page=${page + 1}${q ? `&q=${q}` : ''}`}><ChevronRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
