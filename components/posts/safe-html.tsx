'use client'
import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'

interface SafeHtmlProps {
  html: string
  className?: string
}

/**
 * Safely renders HTML content using DOMPurify.
 *
 * Before DOMPurify hydrates on the client, we show a loading skeleton
 * instead of rendering raw HTML with a weak regex strip. The old approach
 * missed XSS vectors like <img onerror="...">, <a href="javascript:...">, etc.
 */
export default function SafeHtml({ html, className }: SafeHtmlProps) {
  const [sanitized, setSanitized] = useState<string | null>(null)

  useEffect(() => {
    setSanitized(DOMPurify.sanitize(html))
  }, [html])

  // Show a non-interactive skeleton until DOMPurify runs on the client.
  // Never render unsanitized HTML — not even with a regex strip.
  if (sanitized === null) {
    return (
      <div className={className}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
          <div className="h-4 bg-slate-200 rounded w-4/6" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-3/4" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}
