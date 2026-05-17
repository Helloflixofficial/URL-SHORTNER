'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code, ListFilter, Copy, Check, Wand2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  apiToken: string
  baseUrl: string
}

export default function ToolsClient({ apiToken, baseUrl }: Props) {
  const [massUrls, setMassUrls] = useState('')
  const [shortenedResults, setShortenedResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedScript, setCopiedScript] = useState(false)

  const fullPageScript = `
<script type="text/javascript">
    var linksite_api_token = '${apiToken}';
    var linksite_advert_type = 1; // 1=Interstitial, 2=Banner
    var linksite_domains = ['depositfiles.com', 'uploading.com', 'bitshare.com'];
</script>
<script src="${baseUrl}/js/full-page-script.js"></script>
`.trim()

  const handleMassShorten = async () => {
    const urls = massUrls.split('\n').filter(u => u.trim().startsWith('http'))
    if (urls.length === 0) return toast.error('Enter valid URLs')
    
    setLoading(true)
    try {
      const res = await fetch('/api/tools/mass-shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      })
      const data = await res.json()
      if (data.results) setShortenedResults(data.results)
      toast.success(`Shortened ${data.results.length} links!`)
    } catch {
      toast.error('Failed to shorten links')
    } finally {
      setLoading(false)
    }
  }

  const copyScript = () => {
    navigator.clipboard.writeText(fullPageScript)
    setCopiedScript(true)
    toast.success('Script copied to clipboard')
    setTimeout(() => setCopiedScript(false), 2000)
  }

  return (
    <Tabs defaultValue="mass" className="w-full">
      <TabsList className="glass border border-border/50 p-1 h-auto mb-6">
        <TabsTrigger value="mass" className="gap-2 px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <ListFilter className="w-4 h-4" /> Mass Shrinker
        </TabsTrigger>
        <TabsTrigger value="fullpage" className="gap-2 px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Code className="w-4 h-4" /> Full Page Script
        </TabsTrigger>
      </TabsList>

      <TabsContent value="mass">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="text-lg">Mass Shrinker</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Enter up to 20 URLs (one per line) to shorten them all at once.</p>
            <Textarea 
              placeholder="https://example1.com\nhttps://example2.com" 
              className="glass border-border/50 min-h-[150px] font-mono text-sm"
              value={massUrls}
              onChange={e => setMassUrls(e.target.value)}
            />
            <Button 
              onClick={handleMassShorten} 
              disabled={loading}
              className="w-full btn-glow gradient-bg-primary text-primary-foreground h-11"
            >
              {loading ? 'Shortening...' : <><Wand2 className="w-4 h-4 mr-2" /> Mass Shorten</>}
            </Button>

            {shortenedResults.length > 0 && (
              <div className="mt-6 space-y-2">
                <p className="text-xs font-bold uppercase text-primary">Results</p>
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-2">
                  {shortenedResults.map((url, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 text-xs font-mono">
                      <span className="truncate flex-1">{url}</span>
                      <Button variant="ghost" size="icon-sm" onClick={() => navigator.clipboard.writeText(url)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="fullpage">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="text-lg">Full Page Script</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Copy and paste this script into your website&apos;s header or footer. It will automatically convert all external links into your short links.
            </p>
            <div className="relative group">
              <pre className="p-4 rounded-xl bg-muted/50 border border-border/50 font-mono text-[10px] overflow-x-auto">
                {fullPageScript}
              </pre>
              <Button 
                onClick={copyScript}
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary leading-relaxed">
              <strong>Tip:</strong> Edit the <code>linksite_domains</code> array to only shorten specific external domains.
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
