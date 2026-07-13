'use client'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function BlogThemeToggle() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    // Read stored preference
    const stored = localStorage.getItem('blog-theme')
    if (stored === 'light') {
      setDark(false)
      document.documentElement.setAttribute('data-blog-theme', 'light')
    }
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    const val = next ? 'dark' : 'light'
    localStorage.setItem('blog-theme', val)
    document.documentElement.setAttribute('data-blog-theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-9 h-9 rounded-xl flex items-center justify-center border border-border/50 bg-card/50 text-muted-foreground hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}
