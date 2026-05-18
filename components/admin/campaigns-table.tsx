'use client'
import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, CheckSquare, MoreHorizontal, Filter, Search, Pause, Play, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface CampaignRow { id: string; name: string; websiteUrl: string; budget: number; spent: number; status: number; createdAt: Date; user: { username: string } }
interface Props { campaigns: CampaignRow[]; total: number; page: number; pageSize: number; searchQuery: string }

const STATUS = { 
  0: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-400/10' }, 
  1: { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-400/10' }, 
  2: { label: 'Paused', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  3: { label: 'Completed', color: 'text-gray-400', bg: 'bg-gray-400/10' },
  4: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-400/10' } 
}

export default function AdminCampaignsTable({ campaigns, total, page, pageSize, searchQuery }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(searchQuery)
  const [, startT] = useTransition()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const totalPages = Math.ceil(total / pageSize)

  const currentStatus = searchParams.get('status')

  const search = (v: string) => { 
    setQ(v)
    startT(() => {
      const p = new URLSearchParams()
      if (v) p.set('q', v)
      if (currentStatus) p.set('status', currentStatus)
      p.set('page', '1')
      router.push(`/admin/campaigns?${p}`)
    })
  }

  const filterStatus = (status: string | null) => {
    startT(() => {
      const p = new URLSearchParams()
      if (q) p.set('q', q)
      if (status !== null) p.set('status', status)
      p.set('page', '1')
      router.push(`/admin/campaigns?${p}`)
    })
  }

  const updateStatus = async (id: string, status: number) => {
    const res = await fetch(`/api/admin/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) { toast.success('Campaign updated'); router.refresh() }
    else toast.error('Failed to update')
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === campaigns.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(campaigns.map(c => c.id)))
  }

  const massAction = async (action: 'approve' | 'reject' | 'pause' | 'delete') => {
    if (selectedIds.size === 0) return toast.error('No campaigns selected')
    if (action === 'delete' && !confirm('Are you sure you want to delete selected campaigns?')) return
    
    const res = await fetch('/api/admin/campaigns/mass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ids: Array.from(selectedIds) })
    })

    if (res.ok) {
      toast.success(`Campaigns ${action}d successfully`)
      setSelectedIds(new Set())
      router.refresh()
    } else {
      toast.error('Mass action failed')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={q} onChange={e => search(e.target.value)} placeholder="Search by name or URL..." className="pl-9 glass border-border/50 bg-muted/50" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="glass pl-3 pr-4">
                <Filter className="w-4 h-4 mr-2" /> 
                {currentStatus ? STATUS[parseInt(currentStatus) as keyof typeof STATUS]?.label ?? 'Filtered' : 'All Statuses'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="glass border-border">
              <DropdownMenuItem onClick={() => filterStatus(null)}>All Statuses</DropdownMenuItem>
              <DropdownMenuItem onClick={() => filterStatus('0')}>Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => filterStatus('1')}>Active</DropdownMenuItem>
              <DropdownMenuItem onClick={() => filterStatus('2')}>Paused</DropdownMenuItem>
              <DropdownMenuItem onClick={() => filterStatus('3')}>Completed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => filterStatus('4')}>Rejected</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <Button variant="outline" size="sm" className="glass text-xs" onClick={() => massAction('approve')}>
                <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Approve
              </Button>
              <Button variant="outline" size="sm" className="glass text-xs" onClick={() => massAction('pause')}>
                <Pause className="w-3.5 h-3.5 mr-1 text-blue-400" /> Pause
              </Button>
              <Button variant="outline" size="sm" className="glass text-xs text-red-400 border-red-500/30" onClick={() => massAction('delete')}>
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
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
              <TableHead>Campaign</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Spent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No campaigns found</TableCell></TableRow>
            ) : campaigns.map((c) => {
              const s = STATUS[c.status as keyof typeof STATUS] ?? STATUS[0]
              return (
                <TableRow key={c.id} className="border-border/30 table-row-hover group">
                  <TableCell>
                    <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => toggleSelect(c.id)}>
                      <CheckSquare className={`w-4 h-4 ${selectedIds.has(c.id) ? 'text-primary' : 'text-muted-foreground opacity-30 group-hover:opacity-100'}`} />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{c.websiteUrl}</p>
                  </TableCell>
                  <TableCell><span className="text-sm font-medium">{c.user.username}</span></TableCell>
                  <TableCell><span className="font-bold">${c.budget.toFixed(2)}</span></TableCell>
                  <TableCell><span className="text-muted-foreground">${c.spent.toFixed(2)}</span></TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>
                      {s.label}
                    </span>
                  </TableCell>
                  <TableCell><span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass border-border">
                        {c.status === 0 && <DropdownMenuItem className="text-emerald-400 cursor-pointer" onClick={() => updateStatus(c.id, 1)}><CheckCircle className="w-3.5 h-3.5 mr-2" />Approve</DropdownMenuItem>}
                        {c.status === 0 && <DropdownMenuItem className="text-red-400 cursor-pointer" onClick={() => updateStatus(c.id, 4)}><XCircle className="w-3.5 h-3.5 mr-2" />Reject</DropdownMenuItem>}
                        {c.status === 1 && <DropdownMenuItem className="text-blue-400 cursor-pointer" onClick={() => updateStatus(c.id, 2)}><Pause className="w-3.5 h-3.5 mr-2" />Pause</DropdownMenuItem>}
                        {c.status === 2 && <DropdownMenuItem className="text-emerald-400 cursor-pointer" onClick={() => updateStatus(c.id, 1)}><Play className="w-3.5 h-3.5 mr-2" />Resume</DropdownMenuItem>}
                        <DropdownMenuItem className="text-red-400 cursor-pointer" onClick={() => { if(confirm('Delete?')) fetch(`/api/admin/campaigns/mass`, { method: 'POST', body: JSON.stringify({ action: 'delete', ids: [c.id] }) }).then(() => router.refresh()) }}><Trash2 className="w-3.5 h-3.5 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
              <Link href={`/admin/campaigns?page=${page - 1}${q ? `&q=${q}` : ''}${currentStatus ? `&status=${currentStatus}` : ''}`}><ChevronLeft className="w-4 h-4" /></Link>
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} asChild className="glass border-border/50">
              <Link href={`/admin/campaigns?page=${page + 1}${q ? `&q=${q}` : ''}${currentStatus ? `&status=${currentStatus}` : ''}`}><ChevronRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
