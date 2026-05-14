'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Link2, ExternalLink, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReCAPTCHA from 'react-google-recaptcha'
import HCaptcha from '@hcaptcha/react-hcaptcha'

interface InterstitialPageProps {
  link: { url: string; alias: string; title: string }
  adFormDataEncoded: string
  timer: number
  interstitialBannerAd: string
  interstitialAdUrl: string
  captcha: { enabled: boolean; type: string; siteKey: string }
}

export default function InterstitialPage({
  link, adFormDataEncoded, timer, interstitialBannerAd, interstitialAdUrl, captcha,
}: InterstitialPageProps) {
  const [countdown, setCountdown] = useState(timer)
  const [ready, setReady] = useState(timer === 0)
  const [redirecting, setRedirecting] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
        body: JSON.stringify({
          adFormData: adFormDataEncoded,
          cookieData,
          hasAdblock: false,
          captchaToken,
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else window.location.href = link.url
    } catch {
      window.location.href = link.url
    }
  }, [adFormDataEncoded, link.url, redirecting, captchaToken])

  useEffect(() => {
    if (timer === 0) { doRedirect(); return }
    intervalRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(intervalRef.current!)
          setReady(true)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [timer, doRedirect])

  const isCaptchaReady = captcha.enabled ? !!captchaToken : true
  const canRedirect = ready && isCaptchaReady

  const circumference = 2 * Math.PI * 38
  const dashOffset = circumference - (circumference * (timer - countdown)) / (timer || 1)

  const blogUrl = interstitialAdUrl || 'https://helloflix.in'

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      {/* Iframe Content */}
      <div className="flex-1 w-full bg-muted relative">
        <iframe 
          src={blogUrl} 
          className="absolute inset-0 w-full h-full border-none"
          title="Sponsored Content"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>

      {/* Bottom Bar */}
      <div className="h-16 flex items-center justify-between px-4 md:px-8 border-t border-border/40 bg-card z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
            <Link2 className="w-4 h-4 text-white" />
          </div>
          <span className="hidden md:inline-block gradient-text font-bold text-xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Linksite
          </span>
        </div>

        {/* Center: Ad banner if any (optional, kept small for bottom bar) */}
        <div className="hidden lg:flex items-center justify-center flex-1 mx-4">
          {interstitialBannerAd && (
            <div dangerouslySetInnerHTML={{ __html: interstitialBannerAd }} className="max-h-12 overflow-hidden" />
          )}
        </div>

        <div className="flex items-center gap-4">
          {!ready && (
            <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Please wait <span className="font-bold text-foreground">{countdown}</span>s
            </div>
          )}
          
          {captcha.enabled && ready && !captchaToken && (
            <div className="flex items-center scale-75 origin-right">
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
            className="h-10 px-6 rounded-lg text-sm font-semibold transition-all"
            style={{ background: ready ? 'var(--gradient-primary)' : 'var(--color-muted)' }}
          >
            {redirecting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Redirecting...
              </span>
            ) : ready ? (
              <span className="flex items-center gap-2">
                Skip Ad <ExternalLink className="w-4 h-4" />
              </span>
            ) : (
              `Wait ${countdown}s`
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
