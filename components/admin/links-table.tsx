'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, MoreHorizontal, Trash2, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface LinkRow { id: string; alias: string; url: string; hits: number; adType: number; status: number; createdAt: Date; user: { username: string } }
interface Props { links: LinkRow[]; total: number; page: number; pageSize: number; searchQuery: string }

export default function AdminLinksTable({ links, total, page, pageSize, searchQuery }: Props) {
  const router = useRouter()
  const [q, setQ] = useState(searchQuery)
  const [, startT] = useTransition()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const totalPages = Math.ceil(total / pageSize)

  const search = (v: string) => { setQ(v); startT(() => router.push(`/admin/links?page=1${v ? `&q=${v}` : ''}`)) }
  
  const deleteLink = async (id: string) => {
    if (!confirm('Delete this link?')) return
    const res = await fetch(`/api/links/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Deleted'); router.refresh() } else toast.error('Failed')
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === links.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(links.map(l => l.id)))
  }

  const massAction = async (action: 'delete') => {
    if (selectedIds.size === 0) return toast.error('No links selected')
    if (action === 'delete' && !confirm('Are you sure you want to delete selected links? This cannot be undone.')) return
    
    const res = await fetch('/api/admin/links/mass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ids: Array.from(selectedIds) })
    })

    if (res.ok) {
      toast.success(`Links ${action}d successfully`)
      setSelectedIds(new Set())
      router.refresh()
    } else {
      toast.error('Mass action failed')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={q} onChange={e => search(e.target.value)} placeholder="Search alias or URL..." className="pl-9 glass border-border/50 bg-muted/50" />
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button variant="outline" size="sm" className="glass text-xs text-red-400 border-red-500/30" onClick={() => massAction('delete')}>
              Delete Selected
            </Button>
          )}
        </div>
      </div>
      <div className="glass rounded-xl border border-border/50 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 bg-muted/20 hover:bg-muted/20">
              <TableHead className="w-10">
                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={toggleSelectAll}>
                  <CheckSquare className={`w-4 h-4 ${selectedIds.size === links.length && links.length > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                </Button>
              </TableHead>
              <TableHead>Short Link</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No links found</TableCell></TableRow>
              : links.map(l => (
                <TableRow key={l.id} className="border-border/30 table-row-hover group">
                  <TableCell>
                    <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => toggleSelect(l.id)}>
                      <CheckSquare className={`w-4 h-4 ${selectedIds.has(l.id) ? 'text-primary' : 'text-muted-foreground opacity-30 group-hover:opacity-100'}`} />
                    </Button>
                  </TableCell>
                  <TableCell><span className="text-primary font-mono text-sm">/{l.alias}</span></TableCell>
                  <TableCell><span className="text-sm font-medium">{l.user.username}</span></TableCell>
                  <TableCell><span className="text-xs text-muted-foreground truncate block max-w-[180px]">{l.url}</span></TableCell>
                  <TableCell><span className="font-semibold text-primary">{l.hits.toLocaleString()}</span></TableCell>
                  <TableCell><span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(l.createdAt), { addSuffix: true })}</span></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass border-border">
                        <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => deleteLink(l.id)}><Trash2 className="w-3.5 h-3.5 mr-2" />Delete Link</DropdownMenuItem>
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
              <Link href={`/admin/links?page=${page - 1}${q ? `&q=${q}` : ''}`}><ChevronLeft className="w-4 h-4" /></Link>
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} asChild className="glass border-border/50">
              <Link href={`/admin/links?page=${page + 1}${q ? `&q=${q}` : ''}`}><ChevronRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
