'use client'
import { useEffect, useState } from 'react'

export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // The layout uses overflow-y-auto on <main>, listen to it directly
    const container = document.querySelector('main') as HTMLElement | null

    const update = (e: Event) => {
      const el = (e.currentTarget as HTMLElement)
      const scrollHeight = el.scrollHeight - el.clientHeight
      setProgress(scrollHeight > 0 ? (el.scrollTop / scrollHeight) * 100 : 0)
    }

    if (container) {
      container.addEventListener('scroll', update, { passive: true })
      return () => container.removeEventListener('scroll', update)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 transition-all duration-100 shadow-[0_0_8px_rgba(139,92,246,0.8)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
