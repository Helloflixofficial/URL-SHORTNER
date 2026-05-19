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
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-bg-primary">
            <Link2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="gradient-text font-bold text-2xl font-display">
            Linksite
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href}
              className="text-muted-foreground hover:text-foreground transition-colors duration-150 text-sm font-medium">
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
                    <AvatarFallback className="text-xs bg-primary/20 text-primary font-semibold uppercase">
                      {session.user.name?.[0]?.toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{session.user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-popover border-border">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                {((session.user as { role?: string }).role === 'admin' || (session.user as { role?: string }).role === 'owner') && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2 cursor-pointer text-primary">
                      <Shield className="w-4 h-4" /> Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                {(session.user as { role?: string }).role === 'owner' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/admins" className="flex items-center gap-2 cursor-pointer text-primary">
                      <Shield className="w-4 h-4" /> Manage Admins
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
              <Button variant="ghost" asChild className="text-sm text-muted-foreground hover:text-foreground">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="btn-glow text-sm gradient-bg-primary text-primary-foreground">
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
            <Button variant="ghost" size="icon" aria-label="Toggle navigation menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-card border-border w-72">
            <div className="flex flex-col gap-6 mt-8">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl" onClick={() => setMobileOpen(false)}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-bg-primary">
                  <Link2 className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="gradient-text font-bold text-xl font-display">Linksite</span>
              </Link>
              <nav className="flex flex-col gap-3">
                {navLinks.map((l) => (
                  <Link key={l.href} href={l.href}
                    className="text-muted-foreground hover:text-foreground py-2 text-base font-medium transition-colors duration-150"
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
                    {((session.user as { role?: string }).role === 'admin' || (session.user as { role?: string }).role === 'owner') && (
                      <Button asChild variant="outline" className="text-primary border-primary/20" onClick={() => setMobileOpen(false)}>
                        <Link href="/admin"><Shield className="w-4 h-4 mr-2" />Admin Panel</Link>
                      </Button>
                    )}
                    {(session.user as { role?: string }).role === 'owner' && (
                      <Button asChild variant="outline" className="text-primary border-primary/20" onClick={() => setMobileOpen(false)}>
                        <Link href="/admin/admins"><Shield className="w-4 h-4 mr-2" />Manage Admins</Link>
                      </Button>
                    )}
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
                    <Button asChild className="gradient-bg-primary text-primary-foreground" onClick={() => setMobileOpen(false)}>
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
