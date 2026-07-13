'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Edit2, Trash2, Tag, FolderOpen, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Category {
  id: string
  name: string
  slug: string
  postCount: number
}

interface PostTag {
  id: string
  name: string
  slug: string
  postCount: number
}

interface CategoriesManagerProps {
  initialCategories: Category[]
  initialTags: PostTag[]
}

export default function CategoriesManager({
  initialCategories,
  initialTags,
}: CategoriesManagerProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [tags, setTags] = useState(initialTags)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [editingCat, setEditingCat] = useState<{ id: string; name: string } | null>(null)
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null)
  const [deleteTagId, setDeleteTagId] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  // ── Categories ──

  const addCategory = async () => {
    const name = newCategoryName.trim()
    if (!name) return
    setLoading('new-cat')
    try {
      const res = await fetch('/api/admin/posts/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (data.success) {
        setCategories(prev => [...prev, { ...data.category, postCount: 0 }])
        setNewCategoryName('')
        toast.success('Category created')
      } else toast.error(data.error ?? 'Failed')
    } catch { toast.error('Failed to create category') }
    finally { setLoading(null) }
  }

  const updateCategory = async () => {
    if (!editingCat) return
    setLoading(editingCat.id)
    try {
      const res = await fetch(`/api/admin/posts/categories/${editingCat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingCat.name }),
      })
      const data = await res.json()
      if (data.success) {
        setCategories(prev => prev.map(c => c.id === editingCat.id ? { ...c, name: data.category.name, slug: data.category.slug } : c))
        setEditingCat(null)
        toast.success('Category updated')
      } else toast.error(data.error ?? 'Failed')
    } catch { toast.error('Failed to update') }
    finally { setLoading(null) }
  }

  const deleteCategory = async () => {
    if (!deleteCatId) return
    setLoading(deleteCatId)
    try {
      const res = await fetch(`/api/admin/posts/categories/${deleteCatId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setCategories(prev => prev.filter(c => c.id !== deleteCatId))
        toast.success('Category deleted')
      } else toast.error(data.error ?? 'Failed')
    } catch { toast.error('Failed to delete') }
    finally { setLoading(null); setDeleteCatId(null) }
  }

  // ── Tags ──

  const addTag = async () => {
    const name = newTagName.trim()
    if (!name) return
    setLoading('new-tag')
    try {
      const res = await fetch('/api/admin/posts/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (data.success || data.tag) {
        const tag = data.tag
        if (!tags.find(t => t.id === tag.id)) {
          setTags(prev => [...prev, { ...tag, postCount: 0 }])
        }
        setNewTagName('')
        toast.success('Tag added')
      } else toast.error(data.error ?? 'Failed')
    } catch { toast.error('Failed to add tag') }
    finally { setLoading(null) }
  }

  const deleteTag = async () => {
    if (!deleteTagId) return
    setLoading(deleteTagId)
    try {
      const res = await fetch(`/api/admin/posts/tags?id=${deleteTagId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setTags(prev => prev.filter(t => t.id !== deleteTagId))
        toast.success('Tag deleted')
      } else toast.error(data.error ?? 'Failed')
    } catch { toast.error('Failed to delete') }
    finally { setLoading(null); setDeleteTagId(null) }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Categories */}
      <Card className="glass border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-primary" />
            Categories
            <span className="ml-auto text-xs text-muted-foreground font-normal">{categories.length} total</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new */}
          <div className="flex gap-2">
            <Input
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCategory()}
              placeholder="New category name..."
              className="flex-1 h-8 text-sm bg-muted/30 border-border/50"
            />
            <Button
              size="sm"
              className="h-8 gradient-bg-primary text-primary-foreground btn-glow"
              disabled={loading === 'new-cat' || !newCategoryName.trim()}
              onClick={addCategory}
            >
              {loading === 'new-cat' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            </Button>
          </div>

          {/* List */}
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No categories yet</p>
            ) : categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors group">
                {editingCat?.id === cat.id ? (
                  <>
                    <Input
                      value={editingCat.name}
                      onChange={e => setEditingCat({ ...editingCat, name: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && updateCategory()}
                      className="flex-1 h-7 text-xs bg-muted/30 border-border/50"
                      autoFocus
                    />
                    <button onClick={updateCategory} className="text-emerald-400 hover:text-emerald-300">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setEditingCat(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <FolderOpen className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                    <span className="flex-1 text-sm font-medium">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">{cat.postCount} posts</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingCat({ id: cat.id, name: cat.name })} className="text-muted-foreground hover:text-primary">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => setDeleteCatId(cat.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card className="glass border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Tag className="w-4 h-4 text-accent" />
            Tags
            <span className="ml-auto text-xs text-muted-foreground font-normal">{tags.length} total</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new */}
          <div className="flex gap-2">
            <Input
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTag()}
              placeholder="New tag name..."
              className="flex-1 h-8 text-sm bg-muted/30 border-border/50"
            />
            <Button
              size="sm"
              className="h-8 gradient-bg-primary text-primary-foreground btn-glow"
              disabled={loading === 'new-tag' || !newTagName.trim()}
              onClick={addTag}
            >
              {loading === 'new-tag' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            </Button>
          </div>

          {/* Tag pills */}
          <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto">
            {tags.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 w-full text-center">No tags yet</p>
            ) : tags.map(tag => (
              <span
                key={tag.id}
                className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-sm text-accent"
              >
                #{tag.name}
                <span className="text-xs text-muted-foreground">({tag.postCount})</span>
                <button
                  onClick={() => setDeleteTagId(tag.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirm delete category */}
      <AlertDialog open={!!deleteCatId} onOpenChange={() => setDeleteCatId(null)}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              Posts in this category will become uncategorized. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteCategory} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm delete tag */}
      <AlertDialog open={!!deleteTagId} onOpenChange={() => setDeleteTagId(null)}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tag?</AlertDialogTitle>
            <AlertDialogDescription>
              The tag will be removed from the list. Posts may still reference this tag name.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteTag} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
