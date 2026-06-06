'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Link2, Menu, X, LayoutDashboard, LogOut, Settings,
  ChevronDown, Zap, Shield,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const navLinks = [
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full px-4 py-2 transition-all duration-300">
      <div className="mx-auto max-w-6xl h-12 md:h-13 rounded-xl border border-white/[0.08] bg-[#0c101b]/45 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-between px-4 transition-all duration-300 hover:border-white/[0.15] hover:shadow-[0_8px_32px_rgba(99,102,241,0.15)]">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/20 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
            <Link2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent font-bold text-xl font-display tracking-tight group-hover:from-indigo-200 group-hover:to-cyan-200 transition-all duration-300">
            Linksite
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5 bg-white/[0.02] border border-white/[0.04] rounded-full p-1">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href}
              className="text-slate-300 hover:text-white transition-all duration-200 text-xs font-semibold tracking-wide py-1 px-3 rounded-full hover:bg-white/[0.06]">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-2">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1.5 h-8 px-2.5 hover:bg-white/[0.06] rounded-lg border border-transparent hover:border-white/[0.05] transition-all">
                  <Avatar className="w-6 h-6 ring-2 ring-violet-500/30">
                    <AvatarImage src={session.user.image ?? ''} />
                    <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-semibold uppercase">
                      {session.user.name?.[0]?.toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold text-slate-200">{session.user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-[#0c101b]/95 border-white/[0.08] backdrop-blur-xl rounded-xl shadow-2xl p-1.5">
                <DropdownMenuItem asChild className="rounded-lg py-2 focus:bg-white/[0.06] focus:text-white">
                  <Link href="/dashboard" className="flex items-center gap-2.5 cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 text-slate-400" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                {((session.user as { role?: string }).role === 'admin' || (session.user as { role?: string }).role === 'owner') && (
                  <DropdownMenuItem asChild className="rounded-lg py-2 focus:bg-white/[0.06] focus:text-primary">
                    <Link href="/admin" className="flex items-center gap-2.5 cursor-pointer text-primary">
                      <Shield className="w-4 h-4" /> Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                {(session.user as { role?: string }).role === 'owner' && (
                  <DropdownMenuItem asChild className="rounded-lg py-2 focus:bg-white/[0.06] focus:text-primary">
                    <Link href="/admin/admins" className="flex items-center gap-2.5 cursor-pointer text-primary">
                      <Shield className="w-4 h-4" /> Manage Admins
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="rounded-lg py-2 focus:bg-white/[0.06] focus:text-white">
                  <Link href="/settings" className="flex items-center gap-2.5 cursor-pointer">
                    <Settings className="w-4 h-4 text-slate-400" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/[0.08] my-1" />
                <DropdownMenuItem
                  className="text-destructive focus:bg-red-500/10 focus:text-red-400 rounded-lg py-2 cursor-pointer"
                  onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-lg px-3 h-8">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="btn-glow text-xs font-semibold gradient-bg-primary text-primary-foreground rounded-lg px-4 h-8 border border-white/10 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">
                <Link href="/register" className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3" />
                  Get Started
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Toggle navigation menu" className="w-10 h-10 rounded-xl hover:bg-white/[0.06] border border-white/[0.05]">
              {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-[#0c101b]/95 border-white/[0.08] backdrop-blur-xl w-72 rounded-l-2xl shadow-2xl">
            <div className="flex flex-col gap-6 mt-8">
              <Link href="/" className="group flex items-center gap-2.5 font-bold text-xl" onClick={() => setMobileOpen(false)}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/20">
                  <Link2 className="w-4 h-4 text-white" />
                </div>
                <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent font-bold text-xl font-display tracking-tight">Linksite</span>
              </Link>
              <nav className="flex flex-col gap-1.5">
                {navLinks.map((l) => (
                  <Link key={l.href} href={l.href}
                    className="text-slate-300 hover:text-white hover:bg-white/[0.06] py-2 px-3 rounded-lg text-base font-semibold transition-all duration-150"
                    onClick={() => setMobileOpen(false)}>
                    {l.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-3 pt-4 border-t border-white/[0.08]">
                {session?.user ? (
                  <>
                    <Button asChild variant="outline" className="border-white/[0.08] bg-white/[0.02] text-slate-200 hover:bg-white/[0.06] rounded-xl" onClick={() => setMobileOpen(false)}>
                      <Link href="/dashboard"><LayoutDashboard className="w-4 h-4 mr-2 text-slate-400" />Dashboard</Link>
                    </Button>
                    {((session.user as { role?: string }).role === 'admin' || (session.user as { role?: string }).role === 'owner') && (
                      <Button asChild variant="outline" className="text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-xl" onClick={() => setMobileOpen(false)}>
                        <Link href="/admin"><Shield className="w-4 h-4 mr-2" />Admin Panel</Link>
                      </Button>
                    )}
                    {(session.user as { role?: string }).role === 'owner' && (
                      <Button asChild variant="outline" className="text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-xl" onClick={() => setMobileOpen(false)}>
                        <Link href="/admin/admins"><Shield className="w-4 h-4 mr-2" />Manage Admins</Link>
                      </Button>
                    )}
                    <Button variant="ghost" className="text-destructive justify-start hover:bg-red-500/10 hover:text-red-400 rounded-xl"
                      onClick={() => { signOut({ callbackUrl: '/' }); setMobileOpen(false) }}>
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" className="border-white/[0.08] bg-white/[0.02] text-slate-200 hover:bg-white/[0.06] rounded-xl" onClick={() => setMobileOpen(false)}>
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button asChild className="gradient-bg-primary text-primary-foreground rounded-xl" onClick={() => setMobileOpen(false)}>
                      <Link href="/register"><Zap className="w-4 h-4 mr-2" />Get Started Free</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
