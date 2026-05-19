'use client'
import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight, CheckSquare, MoreHorizontal, Filter, Search, Trash2, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface TicketRow { id: string; subject: string; priority: number; status: number; updatedAt: Date; user: { username: string } }
interface Props { tickets: TicketRow[]; total: number; page: number; pageSize: number; searchQuery: string }

const STATUS = {
  0: { label: 'Open', color: 'text-amber-400', bg: 'bg-amber-400/10', icon: Clock },
  1: { label: 'Answered', color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: CheckCircle2 },
  2: { label: 'Closed', color: 'text-muted-foreground', bg: 'bg-white/5', icon: XCircle },
}

export default function AdminTicketsTable({ tickets, total, page, pageSize, searchQuery }: Props) {
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
      router.push(`/admin/tickets?${p}`)
    })
  }

  const filterStatus = (status: string | null) => {
    startT(() => {
      const p = new URLSearchParams()
      if (q) p.set('q', q)
      if (status !== null) p.set('status', status)
      p.set('page', '1')
      router.push(`/admin/tickets?${p}`)
    })
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === tickets.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(tickets.map(t => t.id)))
  }

  const massAction = async (action: 'open' | 'answer' | 'close' | 'delete') => {
    if (selectedIds.size === 0) return toast.error('No tickets selected')
    if (action === 'delete' && !confirm('Are you sure you want to delete selected tickets? This deletes all associated messages.')) return
    
    const res = await fetch('/api/admin/tickets/mass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ids: Array.from(selectedIds) })
    })

    if (res.ok) {
      toast.success(`Tickets ${action}d successfully`)
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
            <Input value={q} onChange={e => search(e.target.value)} placeholder="Search subject..." className="pl-9 glass border-border/50 bg-muted/50" />
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
              <DropdownMenuItem onClick={() => filterStatus('0')}>Open</DropdownMenuItem>
              <DropdownMenuItem onClick={() => filterStatus('1')}>Answered</DropdownMenuItem>
              <DropdownMenuItem onClick={() => filterStatus('2')}>Closed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <Button variant="outline" size="sm" className="glass text-xs" onClick={() => massAction('open')}>
                <Clock className="w-3.5 h-3.5 mr-1 text-amber-400" /> Reopen
              </Button>
              <Button variant="outline" size="sm" className="glass text-xs" onClick={() => massAction('close')}>
                <XCircle className="w-3.5 h-3.5 mr-1 text-muted-foreground" /> Close
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
              <TableHead>Ticket ID & Subject</TableHead>
              <TableHead className="hidden sm:table-cell">User</TableHead>
              <TableHead className="hidden md:table-cell">Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Last Update</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No tickets found</TableCell></TableRow>
            ) : tickets.map((t) => {
              const s = STATUS[t.status as keyof typeof STATUS] ?? STATUS[0]
              return (
                <TableRow key={t.id} className="border-border/30 table-row-hover group">
                  <TableCell>
                    <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => toggleSelect(t.id)}>
                      <CheckSquare className={`w-4 h-4 ${selectedIds.has(t.id) ? 'text-primary' : 'text-muted-foreground opacity-30 group-hover:opacity-100'}`} />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/tickets/${t.id}`} className="block">
                      <p className="text-sm font-bold group-hover:text-primary transition-colors">{t.subject}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">#{t.id.toUpperCase()}</p>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell"><span className="text-sm font-medium">{t.user.username}</span></TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.priority === 2 ? 'bg-red-500/10 text-red-500' :
                      t.priority === 1 ? 'bg-amber-500/10 text-amber-500' :
                      'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {t.priority === 0 ? 'Low' : t.priority === 1 ? 'Medium' : 'High'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-border/50 flex items-center gap-1.5 w-fit ${s.bg} ${s.color}`}>
                      <s.icon className="w-3 h-3" /> {s.label}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell"><span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(t.updatedAt), { addSuffix: true })}</span></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass border-border">
                        <DropdownMenuItem asChild><Link href={`/admin/tickets/${t.id}`} className="cursor-pointer"><ArrowUpRight className="w-3.5 h-3.5 mr-2" />View Ticket</Link></DropdownMenuItem>
                        {t.status !== 2 && <DropdownMenuItem className="text-muted-foreground cursor-pointer" onClick={() => { setSelectedIds(new Set([t.id])); massAction('close') }}><XCircle className="w-3.5 h-3.5 mr-2" />Close Ticket</DropdownMenuItem>}
                        <DropdownMenuItem className="text-red-400 cursor-pointer" onClick={() => { setSelectedIds(new Set([t.id])); massAction('delete') }}><Trash2 className="w-3.5 h-3.5 mr-2" />Delete Ticket</DropdownMenuItem>
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
              <Link href={`/admin/tickets?page=${page - 1}${q ? `&q=${q}` : ''}${currentStatus ? `&status=${currentStatus}` : ''}`}><ChevronLeft className="w-4 h-4" /></Link>
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} asChild className="glass border-border/50">
              <Link href={`/admin/tickets?page=${page + 1}${q ? `&q=${q}` : ''}${currentStatus ? `&status=${currentStatus}` : ''}`}><ChevronRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
