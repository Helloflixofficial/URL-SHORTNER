'use client'
import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Link2, Loader2, CheckCircle2, AlertCircle, X, FileUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadModalProps {
  open: boolean
  fldId?: string
  onClose: () => void
  onSuccess: () => void
}

type UploadState = 'idle' | 'loading' | 'success' | 'error'

function formatSize(bytes: number) {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GB`
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

export default function UploadModal({ open, fldId = '0', onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [fileState, setFileState] = useState<UploadState>('idle')
  const [fileMsg, setFileMsg] = useState('')
  const [fileProgress, setFileProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const [remoteUrl, setRemoteUrl] = useState('')
  const [urlState, setUrlState] = useState<UploadState>('idle')
  const [urlMsg, setUrlMsg] = useState('')
  const [pollFileCode, setPollFileCode] = useState('')

  const pickFile = (picked: File | null) => {
    if (!picked) return
    setFile(picked)
    setFileState('idle')
    setFileMsg('')
    setFileProgress(0)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) pickFile(dropped)
  }, [])

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setFileState('loading')
    setFileMsg('')
    setFileProgress(5)

    try {
      // Step 1 — Get upload server URL + session from our BFF (no file bytes travel through Next.js)
      const serverRes = await fetch('/api/uploads/upload')
      if (!serverRes.ok) {
        const errData = await serverRes.json().catch(() => ({}))
        throw new Error(errData.error ?? `Server error ${serverRes.status}`)
      }
      const { upload_url, sess_id } = await serverRes.json()
      if (!upload_url || !sess_id) throw new Error('Missing upload URL or session from server')

      setFileProgress(20)

      // Step 2 — Upload directly from browser to DataNodes (unlimited size, real progress)
      const formData = new FormData()
      formData.append('sess_id', sess_id)
      formData.append('utype', 'prem')
      formData.append('fld_id', fldId)
      formData.append('file_0', file, file.name)

      const rawResponse = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener('progress', (ev) => {
          if (ev.lengthComputable) {
            setFileProgress(Math.min(20 + Math.round((ev.loaded / ev.total) * 75), 95))
          }
        })
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.responseText)
          else reject(new Error(`DataNodes upload server: HTTP ${xhr.status}`))
        })
        xhr.addEventListener('error', () => reject(new Error('Network error — check your internet connection')))
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))
        xhr.open('POST', upload_url)
        xhr.send(formData)
      })

      setFileProgress(100)

      // Parse DataNodes response (it returns a JSON array)
      let result: { file_code?: string; file_status?: string; msg?: string }[]
      try {
        result = JSON.parse(rawResponse)
      } catch {
        throw new Error(`Unexpected response: ${rawResponse.slice(0, 120)}`)
      }

      const first = result?.[0]
      if (first?.file_status === 'OK' && first?.file_code) {
        setFileState('success')
        setFileMsg(`Uploaded! File code: ${first.file_code}`)
        onSuccess()
      } else {
        // Show the actual DataNodes error so you can debug it
        const reason = first?.msg ?? first?.file_status ?? 'Unknown error from DataNodes'
        throw new Error(`DataNodes: ${reason}`)
      }
    } catch (err) {
      setFileState('error')
      setFileProgress(0)
      setFileMsg(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  const handleUrlUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setUrlState('loading')
    setUrlMsg('')
    setPollFileCode('')
    const trimmed = remoteUrl.trim()
    if (!trimmed) { setUrlState('error'); setUrlMsg('Please enter a URL.'); return }
    try { new URL(trimmed) } catch { setUrlState('error'); setUrlMsg('Enter a valid URL including https://'); return }

    try {
      const res = await fetch(
        `/api/uploads/upload/url?url=${encodeURIComponent(trimmed)}&fld_id=${encodeURIComponent(fldId)}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`)
      if (data.status === 200) {
        setUrlState('success')
        if (data.file_code) {
          setPollFileCode(data.file_code)
          setUrlMsg(`Queued! Code: ${data.file_code} — DataNodes will download it in the background.`)
        } else {
          setUrlMsg('Remote URL queued. DataNodes will process it shortly.')
        }
        onSuccess()
      } else {
        throw new Error(data.msg ?? 'Queue failed')
      }
    } catch (err) {
      setUrlState('error')
      setUrlMsg(err instanceof Error ? err.message : 'Failed to queue URL')
    }
  }

  const handlePollStatus = async () => {
    if (!pollFileCode) return
    try {
      const res = await fetch(`/api/uploads/upload/url?file_code=${encodeURIComponent(pollFileCode)}`)
      const data = await res.json()
      setUrlMsg(`Status: ${data.status === 200 ? 'Complete ✓' : data.msg ?? 'Processing…'} — Code: ${pollFileCode}`)
    } catch { setUrlMsg('Could not check status.') }
  }

  const resetAndClose = () => {
    setFile(null); setFileState('idle'); setFileMsg(''); setFileProgress(0)
    setRemoteUrl(''); setUrlState('idle'); setUrlMsg(''); setPollFileCode('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && resetAndClose()}>
      <DialogContent className="w-[calc(100vw-24px)] max-w-lg bg-card border-border/50 p-4 sm:p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 font-bold text-base">
            <span className="w-8 h-8 rounded-xl gradient-bg-primary flex items-center justify-center shrink-0">
              <FileUp className="w-4 h-4 text-primary-foreground" />
            </span>
            Upload to DataNodes
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="file" className="mt-3">
          <TabsList className="w-full bg-muted/30 h-9">
            <TabsTrigger value="file" className="flex-1 text-xs gap-1.5">
              <Upload className="w-3.5 h-3.5" /> Upload File
            </TabsTrigger>
            <TabsTrigger value="url" className="flex-1 text-xs gap-1.5">
              <Link2 className="w-3.5 h-3.5" /> From URL
            </TabsTrigger>
          </TabsList>

          {/* ── File Upload ── */}
          <TabsContent value="file" className="mt-3">
            <form onSubmit={handleFileUpload} className="space-y-3">
              <div
                className={cn(
                  'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all select-none',
                  dragging ? 'border-primary bg-primary/10 scale-[0.99]' : 'border-border/50 hover:border-primary/50 hover:bg-muted/10',
                  file ? 'border-primary/40 bg-primary/5' : ''
                )}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileState !== 'loading' && fileRef.current?.click()}
                role="button" tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileState !== 'loading' && fileRef.current?.click()}
                aria-label="File drop zone"
              >
                <input ref={fileRef} type="file" className="hidden"
                  onChange={(e) => pickFile(e.target.files?.[0] ?? null)} aria-label="Select file" />
                {file ? (
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center shrink-0">
                      <Upload className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                    </div>
                    {fileState !== 'loading' && (
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); setFile(null); setFileState('idle'); setFileMsg('') }}
                        className="w-7 h-7 rounded-lg hover:bg-destructive/15 hover:text-destructive flex items-center justify-center transition-colors shrink-0"
                        aria-label="Remove file">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium">Drop file or tap to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">Any file · No size limit</p>
                  </>
                )}
              </div>

              {/* Progress */}
              {fileState === 'loading' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{fileProgress < 20 ? 'Getting server…' : fileProgress < 95 ? 'Uploading…' : 'Finishing…'}</span>
                    <span>{fileProgress}%</span>
                  </div>
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full gradient-bg-primary rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${fileProgress}%` }} />
                  </div>
                </div>
              )}

              {fileMsg && (
                <div className={cn(
                  'flex items-start gap-2 text-xs rounded-xl px-3 py-2.5 border',
                  fileState === 'success'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-red-400 bg-red-500/10 border-red-500/20'
                )}>
                  {fileState === 'success'
                    ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    : <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                  <span className="break-all">{fileMsg}</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button type="button" variant="ghost" onClick={resetAndClose}
                  disabled={fileState === 'loading'} className="flex-1 sm:flex-none">
                  {fileState === 'success' ? 'Close' : 'Cancel'}
                </Button>
                <Button type="submit" className="flex-1 btn-glow gradient-bg-primary text-primary-foreground"
                  disabled={!file || fileState === 'loading' || fileState === 'success'}>
                  {fileState === 'loading'
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading…</>
                    : fileState === 'success'
                    ? <><CheckCircle2 className="w-4 h-4 mr-2" />Done!</>
                    : <><Upload className="w-4 h-4 mr-2" />Upload</>}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* ── URL Upload ── */}
          <TabsContent value="url" className="mt-3">
            <form onSubmit={handleUrlUpload} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="remote-url-input" className="text-xs font-semibold">Remote File URL</Label>
                <Input id="remote-url-input" value={remoteUrl}
                  onChange={(e) => { setRemoteUrl(e.target.value); setUrlState('idle'); setUrlMsg('') }}
                  placeholder="https://example.com/file.zip"
                  className="bg-background/50 font-mono text-xs h-10"
                  disabled={urlState === 'loading' || urlState === 'success'} autoFocus />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  DataNodes will download this file to your account in the background.
                  Any publicly accessible direct link works.
                </p>
              </div>

              {urlMsg && (
                <div className={cn(
                  'flex items-start gap-2 text-xs rounded-xl px-3 py-2.5 border',
                  urlState === 'success'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-red-400 bg-red-500/10 border-red-500/20'
                )}>
                  {urlState === 'success'
                    ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    : <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                  <span className="break-all">{urlMsg}</span>
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {pollFileCode && (
                  <Button type="button" variant="outline" size="sm" onClick={handlePollStatus}
                    className="text-xs gap-1.5 w-full sm:w-auto" id="btn-poll-status">
                    <Loader2 className="w-3.5 h-3.5" /> Check Status
                  </Button>
                )}
                <div className="flex gap-2 sm:ml-auto">
                  <Button type="button" variant="ghost" onClick={resetAndClose}
                    disabled={urlState === 'loading'} className="flex-1 sm:flex-none">
                    {urlState === 'success' ? 'Close' : 'Cancel'}
                  </Button>
                  <Button type="submit" className="flex-1 btn-glow gradient-bg-primary text-primary-foreground"
                    disabled={!remoteUrl.trim() || urlState === 'loading' || urlState === 'success'}
                    id="btn-queue-url-upload">
                    {urlState === 'loading'
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Queuing…</>
                      : urlState === 'success'
                      ? <><CheckCircle2 className="w-4 h-4 mr-2" />Queued!</>
                      : <><Link2 className="w-4 h-4 mr-2" />Queue Upload</>}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
