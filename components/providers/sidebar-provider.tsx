'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface SidebarCtx {
  collapsed: boolean
  toggle: () => void
  setCollapsed: (v: boolean) => void
}

const SidebarContext = createContext<SidebarCtx>({
  collapsed: false,
  toggle: () => {},
  setCollapsed: () => {},
})

export function SidebarProvider({ children, storageKey = 'sidebar-collapsed' }: { children: ReactNode; storageKey?: string }) {
  const [collapsed, setCollapsedState] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored === 'true') setCollapsedState(true)
  }, [storageKey])

  const setCollapsed = (v: boolean) => {
    setCollapsedState(v)
    localStorage.setItem(storageKey, String(v))
  }

  const toggle = () => setCollapsed(!collapsed)

  // Cmd/Ctrl+B shortcut
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed])

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}
