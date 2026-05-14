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
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 glass">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
            <Link2 className="w-4 h-4 text-white" />
          </div>
          <span className="gradient-text font-bold text-2xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Linksite
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href}
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-9 px-3">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={session.user.image ?? ''} />
                    <AvatarFallback className="text-xs" style={{ background: 'var(--gradient-primary)' }}>
                      {session.user.name?.[0]?.toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{session.user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 glass border-border">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                {(session.user as { role?: string }).role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                      <Shield className="w-4 h-4" /> Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-sm">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="btn-glow text-sm"
                style={{ background: 'var(--gradient-primary)' }}>
                <Link href="/register">
                  <Zap className="w-3.5 h-3.5 mr-1.5" />
                  Get Started Free
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="glass border-border w-72">
            <div className="flex flex-col gap-6 mt-8">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl" onClick={() => setMobileOpen(false)}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                  <Link2 className="w-4 h-4 text-white" />
                </div>
                <span className="gradient-text font-bold text-xl">Linksite</span>
              </Link>
              <nav className="flex flex-col gap-3">
                {navLinks.map((l) => (
                  <Link key={l.href} href={l.href}
                    className="text-muted-foreground hover:text-foreground py-2 text-base font-medium transition-colors"
                    onClick={() => setMobileOpen(false)}>
                    {l.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                {session?.user ? (
                  <>
                    <Button asChild variant="outline" onClick={() => setMobileOpen(false)}>
                      <Link href="/dashboard"><LayoutDashboard className="w-4 h-4 mr-2" />Dashboard</Link>
                    </Button>
                    <Button variant="ghost" className="text-destructive justify-start"
                      onClick={() => { signOut({ callbackUrl: '/' }); setMobileOpen(false) }}>
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" onClick={() => setMobileOpen(false)}>
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button asChild style={{ background: 'var(--gradient-primary)' }} onClick={() => setMobileOpen(false)}>
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
