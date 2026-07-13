'use client'
import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'

interface SafeHtmlProps {
  html: string
  className?: string
}

export default function SafeHtml({ html, className }: SafeHtmlProps) {
  const [sanitized, setSanitized] = useState('')

  useEffect(() => {
    setSanitized(DOMPurify.sanitize(html))
  }, [html])

  if (!sanitized) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') }} />
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}
