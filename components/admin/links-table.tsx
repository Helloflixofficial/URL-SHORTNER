'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, MoreHorizontal, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface LinkRow { id: string; alias: string; url: string; hits: number; adType: number; status: number; createdAt: Date; user: { username: string } }
interface Props { links: LinkRow[]; total: number; page: number; pageSize: number; searchQuery: string }

export default function AdminLinksTable({ links, total, page, pageSize, searchQuery }: Props) {
  const router = useRouter()
  const [q, setQ] = useState(searchQuery)
  const [, startT] = useTransition()
  const totalPages = Math.ceil(total / pageSize)

  const search = (v: string) => { setQ(v); startT(() => router.push(`/admin/links?page=1${v ? `&q=${v}` : ''}`)) }
  const deleteLink = async (id: string) => {
    if (!confirm('Delete this link?')) return
    const res = await fetch(`/api/links/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Deleted'); router.refresh() } else toast.error('Failed')
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={q} onChange={e => search(e.target.value)} placeholder="Search links..." className="pl-9 glass border-border/50" /></div>
      <div className="glass rounded-2xl border border-border/50 overflow-x-auto">
        <Table>
          <TableHeader><TableRow className="border-border/30">
            <TableHead>Short Link</TableHead><TableHead>User</TableHead><TableHead>Destination</TableHead>
            <TableHead>Clicks</TableHead><TableHead>Created</TableHead><TableHead className="w-10" />
          </TableRow></TableHeader>
          <TableBody>
            {links.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No links found</TableCell></TableRow>
              : links.map(l => (
                <TableRow key={l.id} className="border-border/30 table-row-hover">
                  <TableCell><span className="text-primary font-mono text-sm">/{l.alias}</span></TableCell>
                  <TableCell><span className="text-sm">{l.user.username}</span></TableCell>
                  <TableCell><span className="text-xs text-muted-foreground truncate block max-w-[180px]">{l.url}</span></TableCell>
                  <TableCell><span className="font-semibold">{l.hits.toLocaleString()}</span></TableCell>
                  <TableCell><span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(l.createdAt), { addSuffix: true })}</span></TableCell>
                  <TableCell>
                    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass border-border">
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteLink(l.id)}><Trash2 className="w-3.5 h-3.5 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {page}/{totalPages}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} asChild><Link href={`/admin/links?page=${page - 1}${q ? `&q=${q}` : ''}`}><ChevronLeft className="w-4 h-4" /></Link></Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} asChild><Link href={`/admin/links?page=${page + 1}${q ? `&q=${q}` : ''}`}><ChevronRight className="w-4 h-4" /></Link></Button>
        </div>
      </div>}
    </div>
  )
}
