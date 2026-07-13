'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Save, Code, Download, Upload, Eye } from 'lucide-react'

interface Props {
  initialTheme: string
}

export default function BlogThemeForm({ initialTheme }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [theme, setTheme] = useState(initialTheme)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blog_custom_theme: theme }),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('Blog Theme saved successfully!')
      router.refresh()
    } catch {
      toast.error('Failed to save Blog Theme')
    } finally {
      setSaving(false)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      if (typeof evt.target?.result === 'string') {
        setTheme(evt.target.result)
        toast.success('Theme code loaded from file!')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleDownload = () => {
    if (!theme.trim()) {
      toast.error('Theme template is empty')
      return
    }
    const blob = new Blob([theme], { type: 'text/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'blogger-theme.xml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Theme file downloaded!')
  }

  const handlePreview = () => {
    if (!theme.trim()) {
      toast.error('Theme template is empty')
      return
    }
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/api/admin/posts/preview-theme'
    form.target = '_blank'

    const textarea = document.createElement('textarea')
    textarea.name = 'theme'
    textarea.value = theme
    form.appendChild(textarea)

    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  }

  return (
    <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
      <input
        type="file"
        ref={fileInputRef}
        accept=".xml,.html,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Code className="w-5 h-5 text-primary" />
              Blogger HTML / XML Code
            </CardTitle>
            <CardDescription className="mt-1">
              Paste your custom HTML/Blogger XML theme template code here. This template will control the layout structure of your blog website.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUploadClick}
              className="text-xs h-8 border-border/50 bg-muted/20 hover:bg-muted/40 text-foreground"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Upload file
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="text-xs h-8 border-border/50 bg-muted/20 hover:bg-muted/40 text-foreground"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              className="text-xs h-8 border-border/50 bg-muted/20 hover:bg-muted/40 text-foreground"
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              Preview Theme
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
            Supported template placeholders that will be replaced dynamically on render:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-muted/30 p-3 rounded-lg border border-border/50 font-mono text-[10px] break-all">
            <div><span className="text-primary font-bold">{"{{title}}"}</span>: Post title</div>
            <div><span className="text-primary font-bold">{"{{content}}"}</span>: Post HTML body</div>
            <div><span className="text-primary font-bold">{"{{image}}"}</span>: Featured image URL</div>
            <div><span className="text-primary font-bold">{"{{author}}"}</span>: Author name</div>
            <div><span className="text-primary font-bold">{"{{date}}"}</span>: Published date</div>
            <div><span className="text-primary font-bold">{"{{views}}"}</span>: View counter</div>
            <div><span className="text-primary font-bold">{"{{readingTime}}"}</span>: Reading minutes</div>
            <div><span className="text-primary font-bold">{"{{tags}}"}</span>: Tags list HTML</div>
            <div><span className="text-primary font-bold">{"{{category}}"}</span>: Category name</div>
          </div>
        </div>

        <div className="space-y-2">
          <Textarea
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Paste your Blogger XML/HTML theme template code here..."
            className="font-mono text-xs h-[480px] bg-muted/20 border-border/50 resize-y"
          />
        </div>

        <div className="flex items-center justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="btn-glow gradient-bg-primary text-primary-foreground min-w-[140px]"
          >
            {saving ? (
              'Saving...'
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Theme
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
