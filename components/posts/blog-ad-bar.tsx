'use client'
import { useEffect, useState, useRef } from 'react'
import { ArrowRight, ArrowDown, Lock, Unlock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Props {
  timer: number
  currentStep: number
  totalSteps: number
  alias: string
  adDataEncoded: string
  nextPostSlug: string
}

export default function BlogAdBar({
  timer, currentStep, totalSteps, alias, adDataEncoded, nextPostSlug
}: Props) {
  const [countdown, setCountdown] = useState(timer)
  const [ready, setReady] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          setReady(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleGetLink = async () => {
    if (redirecting) return
    setRedirecting(true)
    const loadingToast = toast.loading('Redirecting to destination...')
    try {
      const cookieData = document.cookie
        .split(';')
        .find(c => c.trim().startsWith('ls_visitor='))
        ?.split('=')?.[1] ?? ''

      const res = await fetch('/api/go', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adFormData: adDataEncoded,
          cookieData,
          hasAdblock: false,
        }),
      })
      const data = await res.json()
      toast.dismiss(loadingToast)
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Failed to resolve link destination')
      }
    } catch {
      toast.dismiss(loadingToast)
      toast.error('Network error. Redirecting...')
    } finally {
      setRedirecting(false)
    }
  }

  const isLastStep = currentStep >= totalSteps

  return (
    <>
      {/* ─── TOP STICKY TIMER BAR ─── */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-[#263238]/95 text-white backdrop-blur-md border-b border-slate-700/80 shadow-[0_4px_30px_rgba(0,0,0,0.15)] py-3 px-6">
        <div className="max-w-[1140px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800 border border-slate-700 shrink-0">
              {ready ? (
                <Unlock className="w-4 h-4 text-[#EEFF41] animate-bounce" />
              ) : (
                <Loader2 className="w-4 h-4 text-[#EEFF41] animate-spin" />
              )}
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-wide uppercase text-slate-300">
                Link Verification (Step {currentStep} of {totalSteps})
              </h4>
              <p className="text-xs text-white font-medium mt-0.5">
                {ready ? (
                  <span className="text-[#EEFF41] flex items-center gap-1 font-bold">
                    Unlocked! Scroll down to the bottom of the page
                    <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                  </span>
                ) : (
                  `Please read this post. Timer unlocks in ${countdown}s...`
                )}
              </p>
            </div>
          </div>

          {!ready && (
            <div className="text-[10px] font-bold tracking-wider uppercase bg-slate-800 text-slate-400 px-2.5 py-1 rounded-[3px] border border-slate-700">
              Waiting {countdown}s
            </div>
          )}
        </div>
      </div>

      {/* ─── BOTTOM ACTION BOX (Rendered at component invocation site below article content) ─── */}
      <div className="mt-8 mb-6 p-6 bg-slate-50 border border-slate-200 rounded-[3px] text-center max-w-2xl mx-auto shadow-sm">
        <h4 className="text-sm font-bold text-[#212121] mb-2 uppercase tracking-wider">
          {ready ? 'Destination Link Ready' : 'Link is Locked'}
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          {ready 
            ? 'Thank you for waiting. Click the button below to continue.' 
            : `Please wait ${countdown} seconds for the system to scan the destination link.`}
        </p>

        <div className="flex justify-center">
          {!ready ? (
            <Button
              disabled
              className="bg-slate-300 text-slate-500 font-bold text-xs px-8 py-3 rounded-[3px] cursor-not-allowed select-none"
            >
              <Lock className="w-3.5 h-3.5 mr-2" />
              Locked (Wait {countdown}s)
            </Button>
          ) : isLastStep ? (
            <Button
              onClick={handleGetLink}
              disabled={redirecting}
              className="bg-[#EEFF41] hover:bg-[#d4e62a] text-[#263238] font-bold text-xs px-8 py-3 rounded-[3px] transition-all duration-200 active:scale-95 shadow-md uppercase tracking-wider animate-pulse"
            >
              {redirecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  Get Link
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </>
              )}
            </Button>
          ) : (
            <Button
              asChild
              className="bg-[#EEFF41] hover:bg-[#d4e62a] text-[#263238] font-bold text-xs px-8 py-3 rounded-[3px] transition-all duration-200 active:scale-95 shadow-md uppercase tracking-wider animate-pulse"
            >
              <a href={`/blog/${nextPostSlug}?alias=${alias}&step=${currentStep + 1}&data=${adDataEncoded}`}>
                Continue to Step {currentStep + 1}
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
