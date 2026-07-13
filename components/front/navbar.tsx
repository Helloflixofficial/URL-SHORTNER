'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useClerk, useUser } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import {
  Link2, LayoutDashboard, LogOut, Settings,
  Zap, Shield, ChevronDown, Menu, X,
  Sparkles,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const NAV_LINKS: { href: string; label: string; icon: React.ElementType }[] = []

/* ─── Utility: merge class strings ─────────────────────────────── */
function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const { isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const pathname = usePathname()

  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [dropOpen,    setDropOpen]    = useState(false)
  const [role,        setRole]        = useState<string | null>(null)

  const dropRef = useRef<HTMLDivElement>(null)

  /* Scroll detection */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* Close mobile on route change */
  useEffect(() => { setMobileOpen(false) }, [pathname])

  /* Fetch role */
  useEffect(() => {
    if (!isSignedIn) { setRole(null); return }
    let live = true
    fetch('/api/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (live) setRole(d?.user?.role ?? null) })
      .catch(() => { if (live) setRole(null) })
    return () => { live = false }
  }, [isSignedIn])

  /* Lock body scroll when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const displayName = user?.username ?? user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? 'User'
  const avatar      = user?.imageUrl ?? ''
  const isAdmin     = role === 'admin' || role === 'owner'
  const isOwner     = role === 'owner'
  const initials    = displayName.slice(0, 2).toUpperCase()

  return (
    <>
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 md:px-6 transition-all duration-300',
          scrolled
            ? 'h-13 bg-[#080c18]/90 backdrop-blur-2xl border-b border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
            : 'h-14 bg-[#080c18]/60 backdrop-blur-xl border-b border-white/[0.04]'
        )}
      >
        {/* ── INNER WRAPPER (full width) ─────────────────────────── */}
        <div className="w-full flex items-center justify-between gap-4">

          {/* ── LOGO ─────────────────────────────────────────── */}
          <Link href="/" className="group flex items-center gap-2.5 shrink-0">
            {/* Icon */}
            <div className="relative w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-600 via-indigo-500 to-cyan-400 shadow-lg shadow-indigo-600/30 group-hover:scale-105 group-hover:rotate-[5deg] transition-all duration-300">
              <Link2 className="w-3.5 h-3.5 text-white drop-shadow" />
              {/* live glow ring */}
              <span className="absolute inset-0 rounded-xl ring-2 ring-indigo-400/0 group-hover:ring-indigo-400/40 transition-all duration-300" />
            </div>
            {/* Wordmark */}
            <span className="font-display font-bold text-[1.15rem] tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:from-indigo-200 group-hover:to-cyan-200 transition-all duration-300">
              Linksite
            </span>

          </Link>

          {/* ── DESKTOP NAV ──────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-1.5 py-1.5">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative px-4 py-1.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200',
                    active
                      ? 'text-white bg-white/[0.08]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  )}
                >
                  {label}
                  {/* Active underline glow */}
                  {active && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400 opacity-80" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* ── DESKTOP AUTH ─────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {isSignedIn ? (
              /* User dropdown */
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen(v => !v)}
                  className={cn(
                    'group flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-xl border transition-all duration-200',
                    dropOpen
                      ? 'bg-white/[0.08] border-white/[0.12]'
                      : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.1]'
                  )}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={avatar} />
                      <AvatarFallback className="text-[11px] bg-gradient-to-br from-violet-600 to-cyan-500 text-white font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#080c18]" />
                  </div>
                  {/* Name */}
                  <span className="text-sm font-semibold text-slate-200 max-w-[110px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className={cn(
                    'w-3.5 h-3.5 text-slate-400 transition-transform duration-200',
                    dropOpen && 'rotate-180'
                  )} />
                </button>

                {/* Dropdown panel */}
                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/[0.08] bg-[#0a0f1e]/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden dropdown-enter p-1.5 z-50">
                    {/* User info header */}
                    <div className="px-3 py-2.5 mb-1 border-b border-white/[0.06]">
                      <p className="text-xs font-bold text-white truncate">{displayName}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 capitalize">{role ?? 'member'}</p>
                    </div>

                    {[
                      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                      ...(isAdmin ? [{ href: '/admin', label: 'Admin Panel', icon: Shield, accent: true }] : []),
                      ...(isOwner ? [{ href: '/admin/admins', label: 'Manage Admins', icon: Shield, accent: true }] : []),
                      { href: '/settings', label: 'Settings', icon: Settings },
                    ].map(({ href, label, icon: Icon, accent }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setDropOpen(false)}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors',
                          accent
                            ? 'text-violet-400 hover:bg-violet-500/10 hover:text-violet-300'
                            : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                        )}
                      >
                        <Icon className="w-4 h-4 opacity-70" />
                        {label}
                      </Link>
                    ))}

                    <div className="my-1 border-t border-white/[0.06]" />

                    <button
                      onClick={() => { signOut({ redirectUrl: '/' }); setDropOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4 opacity-70" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-1.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="group flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-700/30 hover:shadow-violet-600/50 transition-all duration-200 active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-200" />
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* ── MOBILE HAMBURGER ─────────────────────────────── */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white transition-all"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span className={cn('transition-all duration-300', mobileOpen ? 'rotate-90' : 'rotate-0')}>
              {mobileOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </span>
          </button>

        </div>{/* /inner pill */}
      </header>

      {/* ── MOBILE OVERLAY ────────────────────────────────────────── */}
      <div
        className={cn(
          'fixed inset-0 z-40 md:hidden transition-all duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setMobileOpen(false)}
        style={{ background: 'rgba(4,6,18,0.85)', backdropFilter: 'blur(8px)' }}
      />

      {/* ── MOBILE DRAWER ─────────────────────────────────────────── */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-72 z-50 md:hidden flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          'border-l border-white/[0.07] bg-[#080c18]/98 backdrop-blur-2xl shadow-[-20px_0_60px_rgba(0,0,0,0.6)]',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-600 via-indigo-500 to-cyan-400">
              <Link2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-lg bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Linksite
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 rounded-xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer nav links */}
        <nav className="flex flex-col gap-1 px-3 pt-4">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150',
                  active
                    ? 'bg-violet-600/15 text-white border border-violet-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
              </Link>
            )
          })}
        </nav>

        {/* Drawer auth section */}
        <div className="mt-auto px-3 pb-6 pt-4 border-t border-white/[0.06] flex flex-col gap-2">
          {isSignedIn ? (
            <>
              {/* User card */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-1">
                <div className="relative">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={avatar} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-violet-600 to-cyan-500 text-white font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#080c18]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{displayName}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{role ?? 'member'}</p>
                </div>
              </div>

              {[
                { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                ...(isAdmin ? [{ href: '/admin', label: 'Admin Panel', icon: Shield, accent: true }] : []),
                { href: '/settings', label: 'Settings', icon: Settings },
              ].map(({ href, label, icon: Icon, accent }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                    accent
                      ? 'text-violet-400 hover:bg-violet-500/10'
                      : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4 opacity-70" />
                  {label}
                </Link>
              ))}

              <button
                onClick={() => { signOut({ redirectUrl: '/' }); setMobileOpen(false) }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors mt-1"
              >
                <LogOut className="w-4 h-4 opacity-70" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-700/30 hover:from-violet-500 hover:to-indigo-500 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── SPACER: push page content below the fixed header ──────── */}
      <div className="h-14" aria-hidden />
    </>
  )
}
