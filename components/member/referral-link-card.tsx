'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Share2, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function ReferralLinkCard({ referralLink }: { referralLink: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="glass border-border/50 overflow-hidden">
      <CardHeader className="bg-primary/5 pb-6">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" /> Your Referral Link
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Copy your link below and share it on social media, blogs, or forums to start building your network.
        </p>
        <div className="flex gap-2">
          <Input 
            readOnly 
            value={referralLink} 
            className="glass border-border/50 h-11 font-mono text-xs text-primary bg-primary/5" 
          />
          <Button 
            onClick={copyToClipboard}
            className={`shrink-0 w-12 h-11 rounded-lg transition-all ${copied ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'btn-glow gradient-bg-primary text-primary-foreground'}`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <div className="pt-2">
          <div className="flex flex-wrap gap-2">
            {['Twitter', 'Facebook', 'WhatsApp', 'Telegram'].map((platform) => (
              <Button key={platform} variant="outline" size="sm" className="h-8 text-[10px] rounded-full border-border/50 hover:bg-white/5">
                Share on {platform}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
