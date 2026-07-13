'use client'
import { useState, useCallback, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import {
  Search, Plus, Filter, Edit2, Eye, Trash2, Copy, Globe, Globe2,
  ChevronLeft, ChevronRight, CheckSquare, Square, MoreHorizontal,
  SortAsc, SortDesc, FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { PostStatusBadge, type PostStatus } from './post-status-badge'
import { format } from 'date-fns'

interface Post {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  image?: string | null
  status: PostStatus
  authorName?: string | null
  views: number
  wordCount: number
  readingTime: number
  featured: boolean
  tags: string[]
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
  category?: { id: string; name: string; slug: string } | null
}

interface PostsTableProps {
  posts: Post[]
  total: number
  page: number
  limit: number
  isAdmin?: boolean
  baseUrl: string // '/admin/posts' or '/posts'
  apiBase: string // '/api/admin/posts' or '/api/admin/posts' (same for now)
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
]

export default function PostsTable({
  posts: initialPosts,
  total: initialTotal,
  page: initialPage,
  limit,
  isAdmin = false,
  baseUrl,
  apiBase,
}: PostsTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [posts, setPosts] = useState(initialPosts)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(initialPage)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; permanent: boolean } | null>(null)
  const [bulkAction, setBulkAction] = useState('')

  const totalPages = Math.ceil(total / limit)

  const fetchPosts = useCallback(async (params: Record<string, string | number>) => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      Object.entries(params).forEach(([k, v]) => qs.set(k, String(v)))
      const res = await fetch(`${apiBase}?${qs}`)
      const data = await res.json()
      setPosts(data.posts ?? [])
      setTotal(data.total ?? 0)
      setPage(data.page ?? 1)
    } catch {
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  const doSearch = (q: string) => {
    setSearch(q)
    setSelected(new Set())
    fetchPosts({ search: q, status: statusFilter, sortBy, sortDir, page: 1, limit })
  }

  const doFilter = (status: string) => {
    setStatusFilter(status)
    setSelected(new Set())
    fetchPosts({ search, status, sortBy, sortDir, page: 1, limit })
  }

  const doSort = (field: string) => {
    const newDir = sortBy === field && sortDir === 'desc' ? 'asc' : 'desc'
    setSortBy(field)
    setSortDir(newDir)
    fetchPosts({ search, status: statusFilter, sortBy: field, sortDir: newDir, page, limit })
  }

  const doPage = (p: number) => {
    fetchPosts({ search, status: statusFilter, sortBy, sortDir, page: p, limit })
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selected.size === posts.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(posts.map(p => p.id)))
    }
  }

  const handleAction = async (postId: string, action: string) => {
    try {
      if (action === 'delete') {
        setDeleteTarget({ id: postId, permanent: false })
        return
      }
      if (action === 'duplicate') {
        const res = await fetch(`${apiBase}/${postId}/duplicate`, { method: 'POST' })
        const data = await res.json()
        if (data.success) {
          toast.success('Post duplicated as draft')
          startTransition(() => router.push(`${baseUrl}/${data.post.id}/edit`))
        } else toast.error(data.error ?? 'Failed to duplicate')
        return
      }
      if (action === 'publish') {
        const res = await fetch(`${apiBase}/${postId}/publish`, { method: 'POST' })
        const data = await res.json()
        if (data.success) {
          setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: data.status } : p))
          toast.success(`Post ${data.status === 'published' ? 'published' : 'unpublished'}`)
        } else toast.error(data.error ?? 'Failed')
      }
    } catch {
      toast.error('Action failed')
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      const url = `${apiBase}/${deleteTarget.id}${deleteTarget.permanent ? '?permanent=true' : ''}`
      const res = await fetch(url, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(deleteTarget.permanent ? 'Post permanently deleted' : 'Post moved to trash')
        setPosts(prev => prev.filter(p => p.id !== deleteTarget.id))
        setTotal(t => t - 1)
      } else toast.error(data.error ?? 'Failed')
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleteTarget(null)
    }
  }

  const runBulkAction = async (action: string) => {
    if (!action || selected.size === 0) return
    setBulkAction(action)
    try {
      const res = await fetch(`${apiBase}/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selected], action }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Bulk ${action} done`)
        setBulkAction('')
        setSelected(new Set())
        fetchPosts({ search, status: statusFilter, sortBy, sortDir, page, limit })
      } else toast.error(data.error ?? 'Failed')
    } catch {
      toast.error('Bulk action failed')
    }
  }

  const SortIcon = ({ field }: { field: string }) =>
    sortBy === field ? (
      sortDir === 'asc' ? <SortAsc className="w-3 h-3 ml-1 text-primary" /> : <SortDesc className="w-3 h-3 ml-1 text-primary" />
    ) : null

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="posts-search"
              placeholder="Search posts..."
              value={search}
              onChange={e => doSearch(e.target.value)}
              className="pl-9 bg-card border-border/50 h-9 text-sm"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="glass border-border/50 gap-1.5 h-9">
                <Filter className="w-3.5 h-3.5" />
                {statusFilter ? STATUS_OPTIONS.find(s => s.value === statusFilter)?.label : 'Status'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border-border/50">
              {STATUS_OPTIONS.map(opt => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => doFilter(opt.value)}
                  className={statusFilter === opt.value ? 'text-primary' : ''}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          asChild
          className="btn-glow gradient-bg-primary text-primary-foreground h-9 text-sm shrink-0"
        >
          <Link href={`${baseUrl}/new`}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Post
          </Link>
        </Button>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl glass border border-primary/20 bg-primary/5">
          <span className="text-sm font-medium text-primary">{selected.size} selected</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs border-border/50">
                Bulk Action
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border-border/50">
              <DropdownMenuItem onClick={() => runBulkAction('publish')}>Publish All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => runBulkAction('unpublish')}>Unpublish All</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => runBulkAction('trash')}>
                Move to Trash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border/50 glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="w-10 p-3 text-left">
                  <button onClick={selectAll} className="text-muted-foreground hover:text-foreground">
                    {selected.size === posts.length && posts.length > 0
                      ? <CheckSquare className="w-4 h-4 text-primary" />
                      : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="p-3 text-left font-semibold text-muted-foreground">
                  <button onClick={() => doSort('title')} className="flex items-center hover:text-foreground">
                    Post <SortIcon field="title" />
                  </button>
                </th>
                {isAdmin && (
                  <th className="p-3 text-left font-semibold text-muted-foreground hidden lg:table-cell">Author</th>
                )}
                <th className="p-3 text-left font-semibold text-muted-foreground hidden md:table-cell">Status</th>
                <th className="p-3 text-left font-semibold text-muted-foreground hidden xl:table-cell">Category</th>
                <th className="p-3 text-left font-semibold text-muted-foreground hidden lg:table-cell">
                  <button onClick={() => doSort('views')} className="flex items-center hover:text-foreground">
                    Views <SortIcon field="views" />
                  </button>
                </th>
                <th className="p-3 text-left font-semibold text-muted-foreground hidden md:table-cell">
                  <button onClick={() => doSort('createdAt')} className="flex items-center hover:text-foreground">
                    Date <SortIcon field="createdAt" />
                  </button>
                </th>
                <th className="p-3 text-right font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span className="text-sm">Loading posts...</span>
                    </div>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm">No posts found</p>
                      <Button asChild size="sm" className="gradient-bg-primary text-primary-foreground btn-glow">
                        <Link href={`${baseUrl}/new`}><Plus className="w-3.5 h-3.5 mr-1" />Write your first post</Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : posts.map((post) => (
                <tr key={post.id} className="border-b border-border/20 table-row-hover transition-colors">
                  <td className="p-3">
                    <button onClick={() => toggleSelect(post.id)} className="text-muted-foreground hover:text-foreground">
                      {selected.has(post.id)
                        ? <CheckSquare className="w-4 h-4 text-primary" />
                        : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Thumbnail */}
                      <div className="w-12 h-9 rounded-lg overflow-hidden bg-muted/30 shrink-0 flex items-center justify-center">
                        {post.image ? (
                          <img src={post.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-4 h-4 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`${baseUrl}/${post.id}/edit`}
                          className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {post.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          {post.featured && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 font-semibold">Featured</span>
                          )}
                          <span className="text-xs text-muted-foreground">{post.readingTime} min read</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="p-3 text-sm text-muted-foreground hidden lg:table-cell">
                      {post.authorName ?? '—'}
                    </td>
                  )}
                  <td className="p-3 hidden md:table-cell">
                    <PostStatusBadge status={post.status} />
                  </td>
                  <td className="p-3 text-sm text-muted-foreground hidden xl:table-cell">
                    {post.category?.name ?? '—'}
                  </td>
                  <td className="p-3 text-sm text-muted-foreground hidden lg:table-cell">
                    {post.views.toLocaleString()}
                  </td>
                  <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">
                    {format(new Date(post.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="p-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 bg-card border-border/50">
                        <DropdownMenuItem asChild>
                          <Link href={`${baseUrl}/${post.id}/edit`} className="gap-2 cursor-pointer">
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`/blog/${post.slug}?preview=1`} target="_blank" rel="noopener noreferrer" className="gap-2 cursor-pointer">
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction(post.id, 'publish')} className="gap-2 cursor-pointer">
                          {post.status === 'published'
                            ? <><Globe2 className="w-3.5 h-3.5" /> Unpublish</>
                            : <><Globe className="w-3.5 h-3.5" /> Publish</>}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction(post.id, 'duplicate')} className="gap-2 cursor-pointer">
                          <Copy className="w-3.5 h-3.5" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget({ id: post.id, permanent: false })}
                          className="gap-2 text-destructive cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Move to Trash
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7"
                disabled={page <= 1}
                onClick={() => doPage(page - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                return (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'ghost'}
                    size="icon"
                    className={`w-7 h-7 text-xs ${p === page ? 'gradient-bg-primary text-primary-foreground' : ''}`}
                    onClick={() => doPage(p)}
                  >
                    {p}
                  </Button>
                )
              })}
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7"
                disabled={page >= totalPages}
                onClick={() => doPage(page + 1)}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Move post to trash?</AlertDialogTitle>
            <AlertDialogDescription>
              The post will be moved to the trash. You can restore it from there.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Move to Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
