'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Save, Megaphone, Timer, HelpCircle, Layers } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface Props {
  options: Record<string, string>
}

export default function AdsSettingsForm({ options }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  // State
  const [enabled, setEnabled] = useState(options.ads_blog_interstitial_enabled === '1')
  const [timerVal, setTimerVal] = useState(options.ads_blog_interstitial_timer || '25')
  const [stepsVal, setStepsVal] = useState(options.ads_blog_interstitial_steps || '1')

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ads_blog_interstitial_enabled: enabled ? '1' : '0',
          ads_blog_interstitial_timer: String(timerVal),
          ads_blog_interstitial_steps: String(stepsVal),
        }),
      })

      if (!res.ok) throw new Error('Save failed')
      toast.success('Ads settings saved successfully!')
      router.refresh()
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Megaphone className="w-5 h-5 text-primary" />
          Blog Post Interstitial Settings
        </CardTitle>
        <CardDescription>
          Monetize your shortened links by routing visitors through your blog post articles before sending them to their destination.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Toggle Interstitial */}
        <div className="flex items-center justify-between p-4 bg-muted/20 border border-border/50 rounded-xl">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold">Enable Blog Interstitial Mode</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent className="glass">

                    When active, visitors of shortened links will be routed to one or more blog articles with a countdown timer at the bottom before they can access the destination link.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-muted-foreground">
              Routes shortened links through random blog post pages on your site.
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        {/* Configurations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Timer Section */}
          <div className="space-y-2 p-4 bg-muted/10 border border-border/30 rounded-xl">
            <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <Timer className="w-4 h-4 text-primary" />
              Timer Settings
            </div>
            <div className="space-y-1">
              <Label htmlFor="timer-duration" className="text-xs text-muted-foreground">Countdown Timer (seconds)</Label>
              <Input
                id="timer-duration"
                type="number"
                min="5"
                max="300"
                value={timerVal}
                onChange={(e) => setTimerVal(e.target.value)}
                placeholder="25"
                className="h-9 text-sm bg-muted/20 border-border/50"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              How many seconds visitors must wait on each blog page. Minimum: 5s.
            </p>
          </div>

          {/* Steps Section */}
          <div className="space-y-2 p-4 bg-muted/10 border border-border/30 rounded-xl">
            <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <Layers className="w-4 h-4 text-primary" />
              Page Steps
            </div>
            <div className="space-y-1">
              <Label htmlFor="step-count" className="text-xs text-muted-foreground">Required Blog Post Steps (Pages)</Label>
              <Input
                id="step-count"
                type="number"
                min="1"
                max="5"
                value={stepsVal}
                onChange={(e) => setStepsVal(e.target.value)}
                placeholder="1"
                className="h-9 text-sm bg-muted/20 border-border/50"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              The number of random, non-repeating blog posts a user has to read/wait on before the destination link unlocks.
            </p>
          </div>

        </div>

        {/* Instructions */}
        <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-2">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider">How to test:</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            1. Shorten any link in your dashboard.
            <br />
            2. Open the shortened link in an Incognito tab.
            <br />
            3. It will load a random post on your blog, displaying a floating bar at the bottom with a <strong>{timerVal}s timer</strong>.
            <br />
            4. Once the timer finishes, it will unlock the next page or redirect to the destination link.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
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
                Save Settings
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
