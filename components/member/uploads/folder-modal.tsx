'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { FolderPlus, Pencil, Loader2 } from 'lucide-react'

interface FolderModalProps {
  open: boolean
  mode: 'create' | 'rename'
  fldId?: string
  currentName?: string
  parentId?: string
  onClose: () => void
  onSuccess: () => void
}

export default function FolderModal({
  open, mode, fldId, currentName = '', parentId = '0', onClose, onSuccess,
}: FolderModalProps) {
  const [name, setName] = useState(currentName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const trimmed = name.trim()
    if (!trimmed || trimmed.length > 255) {
      setError('Folder name must be 1–255 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/uploads/folders', {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'create'
            ? { parent_id: parentId, name: trimmed }
            : { fld_id: fldId, name: trimmed }
        ),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Operation failed')
      } else {
        onSuccess()
        onClose()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-bold">
            {mode === 'create' ? (
              <><FolderPlus className="w-5 h-5 text-primary" /> Create Folder</>
            ) : (
              <><Pencil className="w-5 h-5 text-primary" /> Rename Folder</>
            )}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Documents"
              maxLength={255}
              autoFocus
              className="bg-background/50"
            />
          </div>
          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-glow gradient-bg-primary text-primary-foreground"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'create' ? 'Create' : 'Rename'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
