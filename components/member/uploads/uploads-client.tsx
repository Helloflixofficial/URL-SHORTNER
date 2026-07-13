'use client'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  FileUp, Search, MoreVertical, Download, Pencil, Copy, FolderInput,
  Trash2, RefreshCw, FolderOpen, ChevronRight, Home, Files,
  Loader2, AlertCircle, CheckCircle2, ShieldAlert, FolderPlus, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import UploadModal from './upload-modal'
import FolderModal from './folder-modal'

interface DNFile {
  file_code: string
  name: string
  size: number
  downloads: number
  fld_id: number
  link: string
  uploaded?: string
}
interface DNFolder { fld_id: number; name: string }
interface Crumb { id: string; name: string }

function fmt(bytes: number) {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GB`
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

// ─── File action dropdown (shared between mobile card & desktop row) ──────────
function FileMenu({
  file, onDownload, onCopyLink, onRename, onClone, onMove, onDelete,
}: {
  file: DNFile
  onDownload: () => void
  onCopyLink: () => void
  onRename: () => void
  onClone: () => void
  onMove: () => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon"
          className="w-9 h-9 shrink-0 text-muted-foreground hover:text-foreground"
          id={`file-menu-${file.file_code}`} aria-label={`Actions for ${file.name}`}>
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border/50 w-48">
        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={onDownload}>
          <Download className="w-3.5 h-3.5" /> Download
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={onCopyLink}>
          <Copy className="w-3.5 h-3.5" /> Copy Link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={onRename}>
          <Pencil className="w-3.5 h-3.5" /> Rename
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={onClone}>
          <Copy className="w-3.5 h-3.5" /> Clone
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={onMove}>
          <FolderInput className="w-3.5 h-3.5" /> Move to Folder
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={onDelete}>
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function UploadsClient() {
  const [files, setFiles] = useState<DNFile[]>([])
  const [totalFiles, setTotalFiles] = useState(0)
  const [page, setPage] = useState(1)
  const perPage = 20
  const [search, setSearch] = useState('')
  const [currentFldId, setCurrentFldId] = useState('0')
  const [folders, setFolders] = useState<DNFolder[]>([])
  const [crumbs, setCrumbs] = useState<Crumb[]>([{ id: '0', name: 'Root' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [deletedFiles, setDeletedFiles] = useState<{ file_code: string; name: string; deleted: string }[]>([])
  const [showDeleted, setShowDeleted] = useState(false)
  const [deletedLoading, setDeletedLoading] = useState(false)

  const [dmcaFiles, setDmcaFiles] = useState<{ file_code: string; reporter: string; reported: string }[]>([])
  const [showDmca, setShowDmca] = useState(false)
  const [dmcaLoading, setDmcaLoading] = useState(false)

  const [uploadOpen, setUploadOpen] = useState(false)
  const [folderCreateOpen, setFolderCreateOpen] = useState(false)
  const [renameFileOpen, setRenameFileOpen] = useState(false)
  const [renameFolderOpen, setRenameFolderOpen] = useState(false)
  const [moveFolderOpen, setMoveFolderOpen] = useState(false)
  const [moveTargetFldId, setMoveTargetFldId] = useState('0')

  const [activeFile, setActiveFile] = useState<DNFile | null>(null)
  const [activeFolder, setActiveFolder] = useState<DNFolder | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchFiles = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams({ page: String(page), per_page: String(perPage), fld_id: currentFldId })
      if (search) params.set('name', search)
      const res = await fetch(`/api/uploads/files?${params}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to load files'); return }
      setFiles(data.result?.files ?? [])
      setTotalFiles(data.result?.results_total ?? 0)
      setFolders(data.result?.folders ?? [])
    } catch { setError('Network error') } finally { setLoading(false) }
  }, [page, perPage, currentFldId, search])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  const navigateFolder = (fld: DNFolder) => {
    setCurrentFldId(String(fld.fld_id))
    setCrumbs((c) => [...c, { id: String(fld.fld_id), name: fld.name }])
    setPage(1); setSearch('')
  }
  const navigateCrumb = (i: number) => {
    const c = crumbs[i]
    setCrumbs(crumbs.slice(0, i + 1))
    setCurrentFldId(c.id); setPage(1); setSearch('')
  }

  const handleDownload = async (file: DNFile) => {
    try {
      const res = await fetch(`/api/uploads/download?file_code=${encodeURIComponent(file.file_code)}`)
      const data = await res.json()
      if (data.result?.url) window.open(data.result.url, '_blank', 'noopener,noreferrer')
      else showToast('Could not generate download link', 'error')
    } catch { showToast('Download failed', 'error') }
  }

  const handleRenameFile = async () => {
    if (!activeFile) return
    const trimmed = renameValue.trim()
    if (!trimmed || trimmed.length > 255) { showToast('Invalid name', 'error'); return }
    try {
      const res = await fetch(`/api/uploads/files/${encodeURIComponent(activeFile.file_code)}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rename', name: trimmed }),
      })
      const data = await res.json()
      if (res.ok) { showToast('Renamed'); setRenameFileOpen(false); fetchFiles() }
      else showToast(data.error ?? 'Rename failed', 'error')
    } catch { showToast('Rename failed', 'error') }
  }

  const handleClone = async (file: DNFile) => {
    try {
      const res = await fetch(`/api/uploads/files/${encodeURIComponent(file.file_code)}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clone' }),
      })
      const data = await res.json()
      if (res.ok && data.result?.filecode) { showToast(`Cloned → ${data.result.filecode}`); fetchFiles() }
      else showToast(data.error ?? 'Clone failed', 'error')
    } catch { showToast('Clone failed', 'error') }
  }

  const handleMove = async () => {
    if (!activeFile) return
    try {
      const res = await fetch(`/api/uploads/files/${encodeURIComponent(activeFile.file_code)}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_folder', fld_id: moveTargetFldId }),
      })
      const data = await res.json()
      if (res.ok) { showToast('Moved'); setMoveFolderOpen(false); fetchFiles() }
      else showToast(data.error ?? 'Move failed', 'error')
    } catch { showToast('Move failed', 'error') }
  }

  const handleDelete = async (file: DNFile) => {
    if (!confirm(`Delete "${file.name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/uploads/files/${encodeURIComponent(file.file_code)}`, { method: 'DELETE' })
      if (res.ok) { showToast('Deleted'); fetchFiles() }
      else { const d = await res.json(); showToast(d.error ?? 'Delete failed', 'error') }
    } catch { showToast('Delete failed', 'error') }
  }

  const handleCopyLink = (file: DNFile) => {
    navigator.clipboard.writeText(file.link).then(() => showToast('Link copied!'))
  }

  const fetchDeleted = async () => {
    setDeletedLoading(true)
    try {
      const res = await fetch('/api/uploads/deleted')
      const data = await res.json()
      setDeletedFiles(data.result ?? []); setShowDeleted(true); setShowDmca(false)
    } catch { showToast('Failed to load', 'error') } finally { setDeletedLoading(false) }
  }

  const fetchDmca = async () => {
    setDmcaLoading(true)
    try {
      const res = await fetch('/api/uploads/dmca')
      const data = await res.json()
      setDmcaFiles(data.result ?? []); setShowDmca(true); setShowDeleted(false)
    } catch { showToast('Failed to load', 'error') } finally { setDmcaLoading(false) }
  }

  const totalPages = Math.ceil(totalFiles / perPage)
  const fileActions = (file: DNFile) => ({
    onDownload: () => handleDownload(file),
    onCopyLink: () => handleCopyLink(file),
    onRename: () => { setActiveFile(file); setRenameValue(file.name); setRenameFileOpen(true) },
    onClone: () => handleClone(file),
    onMove: () => { setActiveFile(file); setMoveTargetFldId('0'); setMoveFolderOpen(true) },
    onDelete: () => handleDelete(file),
  })

  return (
    <div className="space-y-5">

      {/* ── Toast ── */}
      {toast && (
        <div className={cn(
          'fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50',
          'flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-2xl text-sm font-medium border backdrop-blur-sm',
          'animate-in fade-in slide-in-from-bottom-4 duration-300',
          toast.type === 'success'
            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/20 border-red-500/30 text-red-300'
        )}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <AlertCircle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[140px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input id="uploads-search" placeholder="Search files…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 bg-background/50 h-9 text-sm" />
        </div>

        {/* Upload — primary CTA */}
        <Button onClick={() => setUploadOpen(true)}
          className="h-9 btn-glow gradient-bg-primary text-primary-foreground gap-1.5 text-sm px-3"
          id="btn-upload-file">
          <FileUp className="w-4 h-4" />
          <span className="hidden xs:inline">Upload</span>
        </Button>

        {/* New Folder */}
        <Button onClick={() => setFolderCreateOpen(true)} variant="outline"
          className="h-9 gap-1.5 text-sm px-3" id="btn-create-folder">
          <FolderPlus className="w-4 h-4" />
          <span className="hidden sm:inline">New Folder</span>
        </Button>

        {/* Refresh */}
        <Button onClick={fetchFiles} variant="ghost" size="icon"
          className="h-9 w-9 shrink-0" disabled={loading} title="Refresh" id="btn-refresh-files">
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </Button>

        {/* More (deleted / dmca) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" id="btn-more-actions">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border/50 w-48">
            <DropdownMenuItem onClick={fetchDeleted} disabled={deletedLoading}
              className="gap-2 cursor-pointer" id="btn-view-deleted">
              {deletedLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Deleted Files
            </DropdownMenuItem>
            <DropdownMenuItem onClick={fetchDmca} disabled={dmcaLoading}
              className="gap-2 cursor-pointer text-amber-400 focus:text-amber-400" id="btn-view-dmca">
              {dmcaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
              DMCA Reports
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-1 text-sm flex-wrap min-w-0">
        {crumbs.map((c, i) => (
          <span key={c.id} className="flex items-center gap-1 min-w-0">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />}
            <button onClick={() => navigateCrumb(i)} id={`crumb-${c.id}`}
              className={cn(
                'flex items-center gap-1 transition-colors rounded px-1 py-0.5 min-w-0',
                i === crumbs.length - 1
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-primary'
              )}>
              {i === 0 && <Home className="w-3 h-3 shrink-0" />}
              <span className="truncate max-w-[80px] sm:max-w-none text-xs sm:text-sm">{c.name}</span>
            </button>
          </span>
        ))}
        <span className="ml-auto text-xs text-muted-foreground shrink-0">
          {totalFiles} file{totalFiles !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Folders ── */}
      {folders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
          {folders.map((fld) => (
            <div key={fld.fld_id} className="group relative">
              <button onClick={() => navigateFolder(fld)} id={`folder-${fld.fld_id}`}
                className="w-full p-3 rounded-xl border border-border/50 bg-card/60 hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98] transition-all text-left flex items-center gap-2.5">
                <FolderOpen className="w-5 h-5 text-amber-400/80 shrink-0" />
                <span className="text-sm font-medium truncate">{fld.name}</span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-muted/60 flex items-center justify-center transition-all"
                    onClick={(e) => e.stopPropagation()} id={`folder-menu-${fld.fld_id}`}
                    aria-label={`Options for ${fld.name}`}>
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border/50 w-40">
                  <DropdownMenuItem className="gap-2 cursor-pointer"
                    onClick={() => { setActiveFolder(fld); setRenameValue(fld.name); setRenameFolderOpen(true) }}>
                    <Pencil className="w-3.5 h-3.5" /> Rename
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {/* ── File list ── */}
      <Card className="glass border-border/50 overflow-hidden">
        <CardHeader className="py-3 px-4 sm:px-5 bg-gradient-to-r from-primary/10 to-transparent border-b border-border/30">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Files className="w-4 h-4 text-primary" /> Files
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground ml-auto" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm p-5">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* Skeleton */}
          {loading && !files.length && (
            <div className="divide-y divide-border/20">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-8 h-8 rounded-lg bg-muted/30 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-40 bg-muted/40 rounded animate-pulse" />
                    <div className="h-2.5 w-20 bg-muted/30 rounded animate-pulse" />
                  </div>
                  <div className="h-3.5 w-12 bg-muted/30 rounded animate-pulse hidden sm:block" />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && files.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-4">
                <Files className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <p className="font-semibold text-muted-foreground">No files here</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Upload a file to get started</p>
              <Button onClick={() => setUploadOpen(true)}
                className="mt-4 btn-glow gradient-bg-primary text-primary-foreground gap-2 text-sm">
                <FileUp className="w-4 h-4" /> Upload File
              </Button>
            </div>
          )}

          {/* Mobile: cards */}
          {!loading && files.length > 0 && (
            <>
              {/* Desktop table header */}
              <div className="hidden sm:grid grid-cols-[1fr_80px_80px_auto] gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 border-b border-border/20 bg-muted/5">
                <span>Name</span>
                <span className="text-right">Size</span>
                <span className="text-right">Downloads</span>
                <span />
              </div>

              <div className="divide-y divide-border/20">
                {files.map((file) => {
                  const actions = fileActions(file)
                  return (
                    <div key={file.file_code}>
                      {/* Mobile card layout */}
                      <div className="sm:hidden flex items-start gap-3 px-4 py-3.5 hover:bg-muted/10 active:bg-muted/20 transition-colors">
                        {/* File icon chip */}
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Files className="w-4 h-4 text-primary/70" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold leading-snug truncate">{file.name}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs text-muted-foreground font-mono">{file.file_code}</span>
                            <span className="text-xs text-muted-foreground/60">·</span>
                            <span className="text-xs text-muted-foreground">{fmt(file.size)}</span>
                            <span className="text-xs text-muted-foreground/60">·</span>
                            <span className="text-xs text-muted-foreground">{file.downloads.toLocaleString()} ↓</span>
                          </div>
                          {/* Quick actions row on mobile */}
                          <div className="flex gap-2 mt-2">
                            <button onClick={actions.onDownload}
                              className="flex items-center gap-1 text-[11px] font-medium text-primary/80 hover:text-primary bg-primary/10 hover:bg-primary/15 px-2 py-1 rounded-lg transition-colors">
                              <Download className="w-3 h-3" /> Download
                            </button>
                            <button onClick={actions.onCopyLink}
                              className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 px-2 py-1 rounded-lg transition-colors">
                              <Copy className="w-3 h-3" /> Copy
                            </button>
                          </div>
                        </div>
                        <FileMenu file={file} {...actions} />
                      </div>

                      {/* Desktop row */}
                      <div className="hidden sm:grid grid-cols-[1fr_80px_80px_auto] gap-3 items-center px-5 py-3 hover:bg-muted/10 transition-colors group">
                        <div className="min-w-0 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <Files className="w-3.5 h-3.5 text-primary/70" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{file.file_code}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-right">{fmt(file.size)}</p>
                        <p className="text-xs text-muted-foreground text-right">{file.downloads.toLocaleString()}</p>
                        <FileMenu file={file} {...actions} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-border/20">
                  <p className="text-xs text-muted-foreground">Page {page} / {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs"
                      onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} id="btn-prev">
                      ← Prev
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} id="btn-next">
                      Next →
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Deleted Files ── */}
      {showDeleted && (
        <Card className="glass border-amber-500/20">
          <CardHeader className="py-3 px-4 flex flex-row items-center gap-2 border-b border-border/20">
            <Trash2 className="w-4 h-4 text-amber-400" />
            <CardTitle className="text-sm font-bold text-amber-400">Recently Deleted</CardTitle>
            <button onClick={() => setShowDeleted(false)}
              className="ml-auto p-1 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="p-0">
            {deletedFiles.length === 0
              ? <p className="text-sm text-muted-foreground text-center py-8">No deleted files in recovery window.</p>
              : <div className="divide-y divide-border/20">
                  {deletedFiles.map((f) => (
                    <div key={f.file_code} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{f.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{f.file_code}</p>
                      </div>
                      <p className="text-xs text-muted-foreground shrink-0">{f.deleted}</p>
                    </div>
                  ))}
                </div>
            }
          </CardContent>
        </Card>
      )}

      {/* ── DMCA ── */}
      {showDmca && (
        <Card className="glass border-red-500/20">
          <CardHeader className="py-3 px-4 flex flex-row items-center gap-2 border-b border-border/20">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <CardTitle className="text-sm font-bold text-red-400">DMCA Reports</CardTitle>
            <button onClick={() => setShowDmca(false)}
              className="ml-auto p-1 rounded-lg hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="p-0">
            {dmcaFiles.length === 0
              ? <p className="text-sm text-muted-foreground text-center py-8">No DMCA reports 🎉</p>
              : <div className="divide-y divide-border/20">
                  {dmcaFiles.map((f) => (
                    <div key={f.file_code} className="flex items-center justify-between gap-3 px-4 py-3 flex-wrap">
                      <div>
                        <p className="text-sm font-mono font-medium">{f.file_code}</p>
                        <p className="text-xs text-muted-foreground">{f.reporter}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{f.reported}</p>
                    </div>
                  ))}
                </div>
            }
          </CardContent>
        </Card>
      )}

      {/* ── Modals ── */}
      <UploadModal open={uploadOpen} fldId={currentFldId}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => { setUploadOpen(false); fetchFiles() }} />

      <FolderModal open={folderCreateOpen} mode="create" parentId={currentFldId}
        onClose={() => setFolderCreateOpen(false)}
        onSuccess={() => { setFolderCreateOpen(false); fetchFiles(); showToast('Folder created') }} />

      <FolderModal open={renameFolderOpen} mode="rename"
        fldId={activeFolder ? String(activeFolder.fld_id) : undefined}
        currentName={activeFolder?.name ?? ''}
        onClose={() => setRenameFolderOpen(false)}
        onSuccess={() => { setRenameFolderOpen(false); fetchFiles(); showToast('Folder renamed') }} />

      {/* Rename file */}
      <Dialog open={renameFileOpen} onOpenChange={(v) => !v && setRenameFileOpen(false)}>
        <DialogContent className="w-[calc(100vw-24px)] max-w-md bg-card border-border/50 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Pencil className="w-4 h-4 text-primary" /> Rename File
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="rename-file-input" className="text-xs">New name</Label>
              <Input id="rename-file-input" value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)} maxLength={255} autoFocus
                className="bg-background/50" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setRenameFileOpen(false)}>Cancel</Button>
              <Button onClick={handleRenameFile}
                className="btn-glow gradient-bg-primary text-primary-foreground" id="btn-confirm-rename">
                Rename
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Move to folder */}
      <Dialog open={moveFolderOpen} onOpenChange={(v) => !v && setMoveFolderOpen(false)}>
        <DialogContent className="w-[calc(100vw-24px)] max-w-md bg-card border-border/50 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FolderInput className="w-4 h-4 text-primary" /> Move to Folder
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-xs text-muted-foreground truncate">
              Moving: <span className="font-medium text-foreground">{activeFile?.name}</span>
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="move-folder-id" className="text-xs">Target Folder ID</Label>
              <Input id="move-folder-id" value={moveTargetFldId}
                onChange={(e) => setMoveTargetFldId(e.target.value)}
                placeholder="0 = Root" className="bg-background/50" />
              <p className="text-xs text-muted-foreground">Enter 0 to move to root folder.</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setMoveFolderOpen(false)}>Cancel</Button>
              <Button onClick={handleMove}
                className="btn-glow gradient-bg-primary text-primary-foreground" id="btn-confirm-move">
                Move
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
