'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapImage from '@tiptap/extension-image'
import TiptapLink from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table'
import { TableHeader } from '@tiptap/extension-table'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight, common } from 'lowlight'
import { toast } from 'sonner'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Code2,
  List, ListOrdered, Quote, Minus, Link2, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Heading1, Heading2, Heading3, Heading4,
  Undo2, Redo2, Maximize2, Minimize2, Eye, Save, Globe, Globe2, Loader2,
  Table as TableIcon, Tag, X, ChevronRight, Calendar, Clock, FileText,
  Search, Star, StarOff, MessageSquare, MessageSquareOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { PostStatusBadge, type PostStatus } from './post-status-badge'

// Security: DOMPurify sanitizes HTML before displaying rich text from DB
// to prevent XSS when rendering post content in previews.
// TODO(security): Consider server-side sanitization with sanitize-html as a second layer.

const lowlight = createLowlight(common)

interface Category {
  id: string
  name: string
  slug: string
}

interface PostEditorProps {
  postId?: string
  initialData?: {
    title?: string
    content?: string
    excerpt?: string
    image?: string
    status?: PostStatus
    categoryId?: string
    tags?: string[]
    metaTitle?: string
    metaDesc?: string
    focusKw?: string
    featured?: boolean
    allowComments?: boolean
    scheduledAt?: string
    slug?: string
    customTheme?: string
  }
  categories?: Category[]
  isAdmin?: boolean
  baseUrl: string    // e.g. '/admin/posts' or '/posts'
  apiBase: string    // e.g. '/api/admin/posts'
  authorId?: string
}

const TOOLBAR_GROUPS = {
  history: ['undo', 'redo'],
  headings: ['h1', 'h2', 'h3', 'h4'],
  format: ['bold', 'italic', 'underline', 'strike', 'code', 'highlight'],
  align: ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify'],
  lists: ['bulletList', 'orderedList', 'blockquote', 'hr'],
  insert: ['link', 'image', 'codeBlock', 'table'],
}

export default function PostEditor({
  postId,
  initialData = {},
  categories = [],
  isAdmin = false,
  baseUrl,
  apiBase,
}: PostEditorProps) {
  const router = useRouter()
  const isEditing = !!postId

  // State
  const [title, setTitle] = useState(initialData.title ?? '')
  const [excerpt, setExcerpt] = useState(initialData.excerpt ?? '')
  const [image, setImage] = useState(initialData.image ?? '')
  const [status, setStatus] = useState<PostStatus>(initialData.status ?? 'draft')
  const [categoryId, setCategoryId] = useState(initialData.categoryId ?? '')
  const [tags, setTags] = useState<string[]>(initialData.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [metaTitle, setMetaTitle] = useState(initialData.metaTitle ?? '')
  const [metaDesc, setMetaDesc] = useState(initialData.metaDesc ?? '')
  const [focusKw, setFocusKw] = useState(initialData.focusKw ?? '')
  const [featured, setFeatured] = useState(initialData.featured ?? false)
  const [allowComments, setAllowComments] = useState(initialData.allowComments ?? true)
  const [scheduledAt, setScheduledAt] = useState(initialData.scheduledAt ?? '')
  const [slug, setSlug] = useState(initialData.slug ?? '')
  const [customTheme, setCustomTheme] = useState(initialData.customTheme ?? '')
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const autosaveRef = useRef<ReturnType<typeof setTimeout>>(null)
  const createdPostId = useRef<string | null>(postId ?? null)
  const featuredImageInputRef = useRef<HTMLInputElement>(null)
  const editorImageInputRef = useRef<HTMLInputElement>(null)


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3, 4] },
      }),
      CodeBlockLowlight.configure({ lowlight }),
      TiptapImage.configure({ inline: false, allowBase64: true }),
      TiptapLink.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      Placeholder.configure({ placeholder: 'Start writing your post...' }),
      CharacterCount,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialData.content ?? '',
    onUpdate: () => {
      setHasChanges(true)
      scheduleAutosave()
    },
  })

  const wordCount = editor?.storage.characterCount?.words() ?? 0
  const charCount = editor?.storage.characterCount?.characters() ?? 0
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  const scheduleAutosave = useCallback(() => {
    if (autosaveRef.current) clearTimeout(autosaveRef.current)
    autosaveRef.current = setTimeout(() => {
      if (hasChanges || createdPostId.current) autoSave()
    }, 30000) // autosave every 30s
  }, [hasChanges])

  // Warn on unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasChanges])

  useEffect(() => () => { if (autosaveRef.current) clearTimeout(autosaveRef.current) }, [])

  const getPayload = () => ({
    title: title.trim(),
    content: editor?.getHTML() ?? '',
    excerpt: excerpt.trim(),
    image: image.trim(),
    status,
    categoryId: categoryId || undefined,
    tags,
    metaTitle: metaTitle.trim(),
    metaDesc: metaDesc.trim(),
    focusKw: focusKw.trim(),
    featured,
    allowComments,
    scheduledAt: scheduledAt || undefined,
    slug: slug.trim(),
    customTheme: customTheme.trim(),
  })

  const autoSave = async () => {
    if (!title.trim()) return
    try {
      if (!createdPostId.current) {
        const res = await fetch(apiBase, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(getPayload()),
        })
        const data = await res.json()
        if (data.success) {
          createdPostId.current = data.post.id
          setHasChanges(false)
          setLastSaved(new Date())
        }
      } else {
        const res = await fetch(`${apiBase}/${createdPostId.current}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(getPayload()),
        })
        const data = await res.json()
        if (data.success) {
          setHasChanges(false)
          setLastSaved(new Date())
        }
      }
    } catch {
      // Silent fail for autosave — user-triggered saves show toasts
    }
  }

  const handleSave = async (publishStatus?: PostStatus) => {
    if (!title.trim()) { toast.error('Please enter a post title'); return }
    const isSaving = publishStatus === undefined || publishStatus === 'draft'
    isSaving ? setSaving(true) : setPublishing(true)

    try {
      const payload = { ...getPayload(), status: publishStatus ?? status }

      let res: Response
      if (!createdPostId.current) {
        res = await fetch(apiBase, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`${apiBase}/${createdPostId.current}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (data.success || data.post) {
        if (!createdPostId.current && data.post?.id) {
          createdPostId.current = data.post.id
          router.replace(`${baseUrl}/${data.post.id}/edit`)
        }
        setStatus(publishStatus ?? status)
        setHasChanges(false)
        setLastSaved(new Date())
        toast.success(
          publishStatus === 'published' ? 'Post published!' :
          publishStatus === 'draft' ? 'Post unpublished' :
          'Draft saved'
        )
      } else {
        toast.error(data.error ?? 'Save failed')
      }
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(false)
      setPublishing(false)
    }
  }

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase().slice(0, 50)
      if (tag && !tags.includes(tag) && tags.length < 20) {
        setTags(prev => [...prev, tag])
        setHasChanges(true)
      }
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
    setHasChanges(true)
  }

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    const loadingToast = toast.loading('Uploading featured image...')
    try {
      const res = await fetch('/api/admin/posts/upload-image', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      toast.dismiss(loadingToast)

      if (data.success && data.url) {
        setImage(data.url)
        setHasChanges(true)
        toast.success('Featured image uploaded!')
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch (err) {
      toast.dismiss(loadingToast)
      toast.error('Upload failed')
    }
    e.target.value = ''
  }

  const handleEditorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    const loadingToast = toast.loading('Uploading image...')
    try {
      const res = await fetch('/api/admin/posts/upload-image', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      toast.dismiss(loadingToast)

      if (data.success && data.url) {
        editor?.chain().focus().setImage({ src: data.url }).run()
        toast.success('Image uploaded successfully!')
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch (err) {
      toast.dismiss(loadingToast)
      toast.error('Upload failed')
    }
    e.target.value = ''
  }

  const insertImage = () => {
    const uploadLocal = confirm("Would you like to upload an image from your device?\n(Click Cancel if you want to paste an image URL instead)")
    if (uploadLocal) {
      editorImageInputRef.current?.click()
    } else {
      const url = prompt('Image URL:')
      if (url && editor) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    }
  }

  const setLink = () => {
    const url = prompt('Link URL:')
    if (url && editor) {
      editor.chain().focus().toggleLink({ href: url }).run()
    }
  }

  const ToolbarButton = ({
    onClick, active, disabled, title, children
  }: {
    onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'w-7 h-7 rounded-md flex items-center justify-center text-sm transition-colors',
        active
          ? 'bg-primary/20 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
        disabled && 'opacity-30 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  )

  if (!editor) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  )

  return (
    <div className={cn('flex flex-col h-full', fullscreen && 'fixed inset-0 z-50 bg-background')}>
      {/* Hidden file inputs for image upload */}
      <input
        type="file"
        ref={editorImageInputRef}
        accept="image/*"
        onChange={handleEditorImageUpload}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={featuredImageInputRef}
        accept="image/*"
        onChange={handleFeaturedImageUpload}
        style={{ display: 'none' }}
      />
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/30 bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex-1 min-w-0">
          <PostStatusBadge status={status} />
          {lastSaved && (
            <span className="text-xs text-muted-foreground ml-3">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {hasChanges && !lastSaved && (
            <span className="text-xs text-amber-400 ml-3">Unsaved changes</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-border/50 glass hidden sm:flex gap-1.5"
            onClick={() => handleSave('draft')}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Draft
          </Button>
          {status === 'published' ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-border/50 text-muted-foreground"
              onClick={() => handleSave('draft')}
              disabled={publishing}
            >
              <Globe2 className="w-3.5 h-3.5 mr-1" />
              Unpublish
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-8 text-xs btn-glow gradient-bg-primary text-primary-foreground"
              onClick={() => handleSave('published')}
              disabled={publishing}
            >
              {publishing ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Globe className="w-3.5 h-3.5 mr-1" />}
              Publish
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-muted-foreground"
            onClick={() => setFullscreen(f => !f)}
            title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-muted-foreground"
            onClick={() => setSidebarOpen(o => !o)}
            title="Toggle settings"
          >
            <ChevronRight className={cn('w-4 h-4 transition-transform', sidebarOpen && 'rotate-180')} />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Title */}
          <div className="px-8 pt-8 pb-4 border-b border-border/20">
            <textarea
              id="post-title"
              value={title}
              onChange={e => { setTitle(e.target.value); setHasChanges(true) }}
              placeholder="Post title..."
              rows={1}
              className="w-full bg-transparent text-3xl sm:text-4xl font-black font-display text-foreground placeholder:text-muted-foreground/40 resize-none outline-none overflow-hidden leading-tight"
              style={{ height: 'auto' }}
              onInput={e => {
                const t = e.currentTarget
                t.style.height = 'auto'
                t.style.height = t.scrollHeight + 'px'
              }}
            />
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-0.5 px-4 py-2 border-b border-border/20 bg-card/30 overflow-x-auto scrollbar-hide shrink-0">
            {/* History */}
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo2 className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo2 className="w-3.5 h-3.5" /></ToolbarButton>
            <div className="w-px h-5 bg-border/50 mx-1" />
            {/* Headings */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1"><Heading1 className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} active={editor.isActive('heading', { level: 4 })} title="Heading 4"><Heading4 className="w-3.5 h-3.5" /></ToolbarButton>
            <div className="w-px h-5 bg-border/50 mx-1" />
            {/* Formatting */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code"><Code className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight"><span className="text-xs font-bold bg-yellow-400/30 px-1 rounded">H</span></ToolbarButton>
            <div className="w-px h-5 bg-border/50 mx-1" />
            {/* Alignment */}
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left"><AlignLeft className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center"><AlignCenter className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right"><AlignRight className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify"><AlignJustify className="w-3.5 h-3.5" /></ToolbarButton>
            <div className="w-px h-5 bg-border/50 mx-1" />
            {/* Lists & Blocks */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list"><List className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list"><ListOrdered className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule"><Minus className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block"><Code2 className="w-3.5 h-3.5" /></ToolbarButton>
            <div className="w-px h-5 bg-border/50 mx-1" />
            {/* Insert */}
            <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Insert link"><Link2 className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton onClick={insertImage} title="Insert image"><ImageIcon className="w-3.5 h-3.5" /></ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
              title="Insert table"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </ToolbarButton>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto">
            <EditorContent
              editor={editor}
              className="prose prose-invert prose-sm sm:prose-base max-w-none min-h-full px-8 py-6 focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground/40 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_table]:border-collapse [&_td]:border [&_td]:border-border/50 [&_td]:p-2 [&_th]:border [&_th]:border-border/50 [&_th]:p-2 [&_th]:bg-muted/30 [&_pre]:bg-muted/50 [&_pre]:rounded-lg [&_pre]:p-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/50 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground"
            />
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-4 px-8 py-2 border-t border-border/20 text-xs text-muted-foreground bg-card/20 shrink-0">
            <span>{wordCount} words</span>
            <span>{charCount} chars</span>
            <span>{readingTime} min read</span>
          </div>
        </div>

        {/* Settings Sidebar */}
        {sidebarOpen && (
          <aside className="w-72 xl:w-80 border-l border-border/30 flex flex-col bg-card/30 backdrop-blur-sm overflow-y-auto shrink-0">
            <div className="p-4 space-y-5">

              {/* Publish Settings */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Publish</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Status</label>
                    <select
                      value={status}
                      onChange={e => { setStatus(e.target.value as PostStatus); setHasChanges(true) }}
                      className="w-full h-8 rounded-lg bg-muted/30 border border-border/50 text-xs px-2 text-foreground"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                  {status === 'scheduled' && (
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">
                        <Calendar className="w-3 h-3 inline mr-1" />Schedule Date
                      </label>
                      <Input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={e => { setScheduledAt(e.target.value); setHasChanges(true) }}
                        className="h-8 text-xs bg-muted/30 border-border/50"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3" /> Featured Post
                    </label>
                    <button
                      onClick={() => { setFeatured(f => !f); setHasChanges(true) }}
                      className={cn(
                        'w-9 h-5 rounded-full transition-colors relative',
                        featured ? 'bg-primary' : 'bg-muted/50'
                      )}
                    >
                      <span className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                        featured ? 'left-4' : 'left-0.5'
                      )} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> Allow Comments
                    </label>
                    <button
                      onClick={() => { setAllowComments(a => !a); setHasChanges(true) }}
                      className={cn(
                        'w-9 h-5 rounded-full transition-colors relative',
                        allowComments ? 'bg-primary' : 'bg-muted/50'
                      )}
                    >
                      <span className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                        allowComments ? 'left-4' : 'left-0.5'
                      )} />
                    </button>
                  </div>
                </div>
              </section>

              {/* Permalink */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Permalink</h3>
                <Input
                  value={slug}
                  onChange={e => { setSlug(e.target.value); setHasChanges(true) }}
                  placeholder="post-slug-here"
                  className="h-8 text-xs bg-muted/30 border-border/50"
                />
              </section>

              {/* Custom Theme */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Custom Theme (Blogger Template)</h3>
                <p className="text-[10px] text-muted-foreground mb-2 leading-relaxed">
                  Paste raw HTML/Blogger template code. Use placeholders:
                  <code className="block bg-muted/50 p-1 rounded mt-1 font-mono text-[9px] break-all">
                    {"{{title}}, {{content}}, {{image}}, {{author}}, {{date}}, {{views}}, {{readingTime}}, {{tags}}, {{category}}"}
                  </code>
                </p>
                <Textarea
                  value={customTheme}
                  onChange={e => { setCustomTheme(e.target.value); setHasChanges(true) }}
                  placeholder="Paste custom theme HTML template here..."
                  rows={6}
                  className="text-xs bg-muted/30 border-border/50 font-mono"
                />
              </section>


              {/* Featured Image */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Featured Image</h3>
                {image ? (
                  <div className="relative rounded-lg overflow-hidden mb-2">
                    <img src={image} alt="" className="w-full h-32 object-cover rounded-lg" />
                    <button
                      onClick={() => { setImage(''); setHasChanges(true) }}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <Input
                    value={image}
                    onChange={e => { setImage(e.target.value); setHasChanges(true) }}
                    placeholder="Image URL..."
                    className="h-8 text-xs bg-muted/30 border-border/50 flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => featuredImageInputRef.current?.click()}
                    className="h-8 px-2.5 text-[11px] font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-colors shrink-0"
                  >
                    Upload
                  </Button>
                </div>
              </section>

              {/* Excerpt */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Excerpt</h3>
                <Textarea
                  value={excerpt}
                  onChange={e => { setExcerpt(e.target.value); setHasChanges(true) }}
                  placeholder="Short summary of your post..."
                  rows={3}
                  className="text-xs bg-muted/30 border-border/50 resize-none"
                />
              </section>

              {/* Category */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Category</h3>
                <select
                  value={categoryId}
                  onChange={e => { setCategoryId(e.target.value); setHasChanges(true) }}
                  className="w-full h-8 rounded-lg bg-muted/30 border border-border/50 text-xs px-2 text-foreground"
                >
                  <option value="">Uncategorized</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </section>

              {/* Tags */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Tags</h3>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs"
                    >
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder="Add tag, press Enter..."
                  className="h-8 text-xs bg-muted/30 border-border/50"
                />
              </section>

              {/* SEO */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Search className="w-3 h-3" />SEO
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Meta Title</label>
                    <Input
                      value={metaTitle}
                      onChange={e => { setMetaTitle(e.target.value); setHasChanges(true) }}
                      placeholder="SEO title..."
                      className="h-8 text-xs bg-muted/30 border-border/50"
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">{metaTitle.length}/60 chars</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Meta Description</label>
                    <Textarea
                      value={metaDesc}
                      onChange={e => { setMetaDesc(e.target.value); setHasChanges(true) }}
                      placeholder="SEO description..."
                      rows={3}
                      className="text-xs bg-muted/30 border-border/50 resize-none"
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">{metaDesc.length}/160 chars</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Focus Keyword</label>
                    <Input
                      value={focusKw}
                      onChange={e => { setFocusKw(e.target.value); setHasChanges(true) }}
                      placeholder="Focus keyword..."
                      className="h-8 text-xs bg-muted/30 border-border/50"
                    />
                  </div>
                </div>
              </section>

              {/* Reading stats */}
              <section className="pb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Reading Info
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Words', value: wordCount },
                    { label: 'Chars', value: charCount },
                    { label: 'Min Read', value: readingTime },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg bg-muted/20 border border-border/30 p-2 text-center">
                      <p className="text-base font-bold gradient-text">{value}</p>
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
