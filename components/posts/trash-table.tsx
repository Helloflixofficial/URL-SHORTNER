'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { RotateCcw, Trash2, FileText, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface TrashedPost {
  id: string
  title: string
  authorName?: string | null
  trashedAt?: string | null
  createdAt: string
}

interface TrashTableProps {
  posts: TrashedPost[]
  isAdmin?: boolean
  apiBase: string
}

export default function TrashTable({ posts: initial, isAdmin = false, apiBase }: TrashTableProps) {
  const [posts, setPosts] = useState(initial)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const handleRestore = async (id: string) => {
    setLoading(id)
    try {
      const res = await fetch(`${apiBase}/${id}/restore`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setPosts(prev => prev.filter(p => p.id !== id))
        toast.success('Post restored to drafts')
      } else toast.error(data.error ?? 'Restore failed')
    } catch {
      toast.error('Restore failed')
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setLoading(deleteTarget)
    try {
      const res = await fetch(`${apiBase}/${deleteTarget}?permanent=true`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setPosts(prev => prev.filter(p => p.id !== deleteTarget))
        toast.success('Post permanently deleted')
      } else toast.error(data.error ?? 'Delete failed')
    } catch {
      toast.error('Delete failed')
    } finally {
      setLoading(null)
      setDeleteTarget(null)
    }
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
          <Trash2 className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h3 className="font-semibold text-lg mb-1">Trash is empty</h3>
        <p className="text-muted-foreground text-sm">Deleted posts will appear here</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-border/50 glass overflow-hidden">
        <div className="px-4 py-3 border-b border-border/20 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <p className="text-sm text-muted-foreground">
            Trashed posts are not visible to readers. Restore or permanently delete them below.
          </p>
        </div>
        <div className="divide-y divide-border/20">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center gap-4 px-4 py-3.5 table-row-hover">
              <div className="w-9 h-9 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate line-through text-muted-foreground">{post.title}</p>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                  {isAdmin && post.authorName && <span>{post.authorName}</span>}
                  <span>Deleted {post.trashedAt ? format(new Date(post.trashedAt), 'MMM d, yyyy') : '—'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-border/50 gap-1.5"
                  disabled={loading === post.id}
                  onClick={() => handleRestore(post.id)}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5"
                  disabled={loading === post.id}
                  onClick={() => setDeleteTarget(post.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Permanently delete post?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post will be permanently removed from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
