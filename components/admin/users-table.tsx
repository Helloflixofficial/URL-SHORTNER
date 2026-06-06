'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, MoreHorizontal, ChevronLeft, ChevronRight, Ban, CheckCircle, Download, CheckSquare } from 'lucide-react'
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
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

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(users.map(u => u.id)))
  }

  const massAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedIds.size === 0) return toast.error('No users selected')
    if (action === 'delete' && !confirm('Are you sure you want to delete selected users? This cannot be undone.')) return
    
    const res = await fetch('/api/admin/users/mass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ids: Array.from(selectedIds) })
    })

    if (res.ok) {
      toast.success(`Users ${action}d successfully`)
      setSelectedIds(new Set())
      router.refresh()
    } else {
      toast.error('Mass action failed')
    }
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return
    
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete user')
      
      toast.success('User deleted successfully')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={q} onChange={e => search(e.target.value)} placeholder="Search users by name/email..." className="pl-9 glass border-border/50 bg-muted/50" />
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <Button variant="outline" size="sm" className="glass text-xs" onClick={() => massAction('activate')}>
                <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Activate
              </Button>
              <Button variant="outline" size="sm" className="glass text-xs" onClick={() => massAction('deactivate')}>
                <Ban className="w-3.5 h-3.5 mr-1 text-red-400" /> Ban
              </Button>
              <Button variant="outline" size="sm" className="glass text-xs text-red-400 border-red-500/30" onClick={() => massAction('delete')}>
                Delete Selected
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" asChild className="glass text-xs">
            <a href={`/api/admin/users/export${q ? `?q=${q}` : ''}`} download>
              <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
            </a>
          </Button>
        </div>
      </div>

      <div className="glass rounded-xl border border-border/50 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 bg-muted/20 hover:bg-muted/20">
              <TableHead className="w-10">
                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={toggleSelectAll}>
                  <CheckSquare className={`w-4 h-4 ${selectedIds.size === users.length && users.length > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                </Button>
              </TableHead>
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
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No users found</TableCell>
              </TableRow>
            ) : users.map((u) => (
              <TableRow key={u.id} className="border-border/30 table-row-hover group">
                <TableCell>
                  <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => toggleSelect(u.id)}>
                    <CheckSquare className={`w-4 h-4 ${selectedIds.has(u.id) ? 'text-primary' : 'text-muted-foreground opacity-30 group-hover:opacity-100'}`} />
                  </Button>
                </TableCell>
                <TableCell>
                  <Link href={`/admin/users/${u.id}`} className="block">
                    <p className="text-sm font-medium hover:text-primary transition-colors">{u.username}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </Link>
                </TableCell>
                <TableCell>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.role === 'owner' ? 'gradient-bg-primary text-primary-foreground' : u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground'}`}>
                    {u.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold capitalize ${statusColor(u.status)} px-2 py-0.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500/10' : u.status === 'banned' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                    {u.status}
                  </span>
                </TableCell>
                <TableCell><span className="font-semibold text-primary">${u.balance.toFixed(2)}</span></TableCell>
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
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${u.id}`} className="cursor-pointer">View Details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${u.id}/edit`} className="cursor-pointer">Edit User</Link>
                      </DropdownMenuItem>
                      {u.role !== 'owner' && (
                        <DropdownMenuItem 
                          className="text-red-400 cursor-pointer focus:bg-red-500/10 focus:text-red-400"
                          onClick={() => deleteUser(u.id)}
                        >
                          Delete User
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
            <Button variant="outline" size="sm" disabled={page <= 1} asChild className="glass border-border/50">
              <Link href={`/admin/users?page=${page - 1}${q ? `&q=${q}` : ''}`}><ChevronLeft className="w-4 h-4" /></Link>
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} asChild className="glass border-border/50">
              <Link href={`/admin/users?page=${page + 1}${q ? `&q=${q}` : ''}`}><ChevronRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
