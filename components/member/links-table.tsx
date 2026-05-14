'use client'
import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Link2, Copy, Search, MoreHorizontal, Pencil, Trash2, BarChart3,
  ChevronLeft, ChevronRight, ExternalLink,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface LinkRow {
  id: string; alias: string; url: string; title: string | null
  hits: number; adType: number; status: number; createdAt: Date
}

interface Props {
  links: LinkRow[]; total: number; page: number; pageSize: number
  baseUrl: string; searchQuery: string
}

const AD_TYPE_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Direct', color: 'bg-slate-500/20 text-slate-300' },
  1: { label: 'Interstitial', color: 'bg-purple-500/20 text-purple-300' },
  2: { label: 'Banner', color: 'bg-cyan-500/20 text-cyan-300' },
  3: { label: 'Random', color: 'bg-amber-500/20 text-amber-300' },
}

export default function LinksTable({ links, total, page, pageSize, baseUrl, searchQuery }: Props) {
  const router = useRouter()
  const [q, setQ] = useState(searchQuery)
  const [, startTransition] = useTransition()
  const totalPages = Math.ceil(total / pageSize)

  const search = (value: string) => {
    setQ(value)
    startTransition(() => {
      const params = new URLSearchParams()
      if (value) params.set('q', value)
      params.set('page', '1')
      router.push(`/links?${params.toString()}`)
    })
  }

  const copy = (alias: string) => {
    navigator.clipboard.writeText(`${baseUrl}/${alias}`)
    toast.success('Copied!')
  }

  const deleteLink = async (id: string) => {
    if (!confirm('Delete this link? This cannot be undone.')) return
    const res = await fetch(`/api/links/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Link deleted'); router.refresh() }
    else toast.error('Failed to delete')
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => search(e.target.value)}
          placeholder="Search links..." className="pl-9 h-10 glass border-border/50" />
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-border/50 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Short Link</TableHead>
              <TableHead className="text-muted-foreground hidden md:table-cell">Destination</TableHead>
              <TableHead className="text-muted-foreground">Clicks</TableHead>
              <TableHead className="text-muted-foreground hidden sm:table-cell">Type</TableHead>
              <TableHead className="text-muted-foreground hidden lg:table-cell">Created</TableHead>
              <TableHead className="text-muted-foreground w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                  <Link2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No links found</p>
                </TableCell>
              </TableRow>
            ) : links.map((link) => {
              const typeInfo = AD_TYPE_LABELS[link.adType] ?? AD_TYPE_LABELS[1]
              return (
                <TableRow key={link.id} className="border-border/30 table-row-hover">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>
                        <Link2 className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <span className="text-primary text-sm font-medium">/{link.alias}</span>
                        {link.title && <p className="text-xs text-muted-foreground truncate max-w-[140px]">{link.title}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs text-muted-foreground truncate block max-w-[200px]">{link.url}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{link.hits.toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass border-border">
                        <DropdownMenuItem onClick={() => copy(link.alias)}>
                          <Copy className="w-3.5 h-3.5 mr-2" />Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`${baseUrl}/${link.alias}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3.5 h-3.5 mr-2" />Open Link
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/links/${link.id}/stats`}>
                            <BarChart3 className="w-3.5 h-3.5 mr-2" />Statistics
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/links/${link.id}/edit`}>
                            <Pencil className="w-3.5 h-3.5 mr-2" />Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteLink(link.id)}>
                          <Trash2 className="w-3.5 h-3.5 mr-2" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} asChild>
              <Link href={`/links?page=${page - 1}${q ? `&q=${q}` : ''}`}>
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </Button>
            <span className="text-sm font-medium px-2">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} asChild>
              <Link href={`/links?page=${page + 1}${q ? `&q=${q}` : ''}`}>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
