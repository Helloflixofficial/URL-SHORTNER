'use client'
import { useEffect, useState, useCallback } from 'react'
import { Link2, ExternalLink, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import ReCAPTCHA from 'react-google-recaptcha'
import HCaptcha from '@hcaptcha/react-hcaptcha'

interface BannerPageProps {
  link: { url: string; alias: string; title: string }
  adFormDataEncoded: string
  timer: number
  banner728: string
  banner468: string
  banner336: string
  captcha: { enabled: boolean; type: string; siteKey: string }
}

export default function BannerPage({
  link, adFormDataEncoded, timer, banner728, banner468, banner336, captcha,
}: BannerPageProps) {
  const [countdown, setCountdown] = useState(timer)
  const [ready, setReady] = useState(timer === 0)
  const [redirecting, setRedirecting] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const doRedirect = useCallback(async () => {
    if (redirecting) return
    setRedirecting(true)
    try {
      const cookieData = document.cookie
        .split(';')
        .find(c => c.trim().startsWith('ls_visitor='))
        ?.split('=')?.[1] ?? ''
      const res = await fetch('/api/go', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adFormData: adFormDataEncoded, cookieData, hasAdblock: false, captchaToken }),
      })
      const data = await res.json()
      window.location.href = data.url || link.url
    } catch {
      window.location.href = link.url
    }
  }, [adFormDataEncoded, link.url, redirecting, captchaToken])

  useEffect(() => {
    if (timer === 0) { doRedirect(); return }
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(interval); setReady(true); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timer, doRedirect])

  const progress = ((timer - countdown) / (timer || 1)) * 100
  const isCaptchaReady = captcha.enabled ? !!captchaToken : true
  const canRedirect = ready && isCaptchaReady

  return (
    <div className="min-h-screen hero-bg flex flex-col px-4 py-8">
      {/* Top banner ad */}
      {banner728 && (
        <div className="flex justify-center mb-6">
          <div dangerouslySetInnerHTML={{ __html: banner728 }} />
        </div>
      )}

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          {/* Brand */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center gradient-bg-primary">
              <Link2 className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="gradient-text font-bold text-lg font-display">Linksite</span>
          </div>

          <div className="glass rounded-3xl border border-border/50 overflow-hidden">
            {/* Middle banner */}
            {banner336 && (
              <div className="flex justify-center p-6 border-b border-border/30">
                <div dangerouslySetInnerHTML={{ __html: banner336 }} />
              </div>
            )}

            <div className="p-8 text-center">
              <h2 className="text-xl font-bold mb-2">
                {ready ? 'Your link is ready!' : `Redirecting in ${countdown}s...`}
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                {link.title || 'You are being redirected to your destination.'}
              </p>

              {/* Progress bar */}
              <Progress value={progress} className="mb-6 h-2" />

              {captcha.enabled && ready && !captchaToken && (
                <div className="flex justify-center mb-6">
                  {captcha.type === 'recaptcha' ? (
                    <ReCAPTCHA sitekey={captcha.siteKey} onChange={(t) => setCaptchaToken(t)} />
                  ) : (
                    <HCaptcha sitekey={captcha.siteKey} onVerify={(t) => setCaptchaToken(t)} />
                  )}
                </div>
              )}

              <Button
                onClick={doRedirect}
                disabled={!canRedirect || redirecting}
                className={`px-8 h-12 rounded-xl text-base btn-glow text-primary-foreground ${ready ? 'gradient-bg-primary' : ''}`}
              >
                {redirecting ? 'Redirecting...' : ready ? (
                  <span className="flex items-center gap-2">
                    Continue <ExternalLink className="w-4 h-4" />
                  </span>
                ) : `Wait ${countdown}s`}
              </Button>

              <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-muted-foreground">
                <Shield className="w-3 h-3" />
                <span>Safe & verified link</span>
              </div>
            </div>
          </div>

          {/* Bottom 468x60 banner */}
          {banner468 && (
            <div className="flex justify-center mt-6">
              <div dangerouslySetInnerHTML={{ __html: banner468 }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
