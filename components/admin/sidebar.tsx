'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Users, Link2, Megaphone, ArrowDownToLine,
  CreditCard, FileText, BookOpen, MessageSquare, Star,
  Settings, LogOut, Shield, TrendingUp, BarChart3,
  ChevronLeft, ChevronRight, UserCheck, Globe, Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Menu } from 'lucide-react'

const navSections = [
  {
    label: 'Manage',
    items: [
      { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
      { href: '/admin/users', icon: Users, label: 'Users' },
      { href: '/admin/links', icon: Link2, label: 'Links' },
      { href: '/admin/campaigns', icon: Megaphone, label: 'Campaigns' },
      { href: '/admin/referrals', icon: UserCheck, label: 'Referrals' },
      { href: '/admin/reports', icon: BarChart3, label: 'Reports' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/admin/withdrawals', icon: ArrowDownToLine, label: 'Withdrawals' },
      { href: '/admin/payout-rates', icon: TrendingUp, label: 'Payout Rates' },
      { href: '/admin/invoices', icon: CreditCard, label: 'Deposits' },
      { href: '/admin/plans', icon: FileText, label: 'Plans' },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/posts', icon: BookOpen, label: 'Blog Posts' },
      { href: '/admin/pages', icon: Globe, label: 'Pages' },
      { href: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
      { href: '/admin/testimonials', icon: Star, label: 'Testimonials' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/tickets', icon: MessageSquare, label: 'Support Tickets' },
      { href: '/admin/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null; role?: string }
  collapsed?: boolean
  onCollapseChange?: (v: boolean) => void
  pendingCount?: number
}

export default function AdminSidebar({ user, collapsed = false, onCollapseChange, pendingCount = 0 }: Props) {
  const pathname = usePathname()

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href))

  const SidebarInner = ({ slim }: { slim?: boolean }) => (
    <>
      {/* Logo */}
      <div className={cn('flex items-center border-b border-border/30 shrink-0', slim ? 'h-14 justify-center px-2' : 'h-14 px-4 gap-2')}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center gradient-bg-primary shrink-0">
          <Shield className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        {!slim && <span className="gradient-text font-black text-lg font-display">Admin Panel</span>}
        {!slim && onCollapseChange && (
          <button
            onClick={() => onCollapseChange(true)}
            className="ml-auto w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {slim && onCollapseChange && (
          <button
            onClick={() => onCollapseChange(false)}
            className="absolute -right-3 top-16 w-6 h-6 rounded-full border border-border/50 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground shadow-md z-10"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navSections.map((section) => {
          let items = section.items
          if (section.label === 'System' && user?.role === 'owner') {
            items = [{ href: '/admin/admins', icon: Shield, label: 'Admins' }, ...items]
          }
          
          return (
          <div key={section.label}>
            {!slim && <p className="nav-section-label">{section.label}</p>}
            {slim && <div className="h-px bg-border/30 mx-3 my-1.5" />}
            {items.map((item) => {
              const active = isActive(item.href, (item as { exact?: boolean }).exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={slim ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-2.5 mx-2 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                    slim && 'justify-center',
                    active
                      ? 'sidebar-item-active text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!slim && <span className="flex-1 truncate">{item.label}</span>}
                  {!slim && active && <ChevronRight className="w-3 h-3 shrink-0" />}
                </Link>
              )
            })}
          </div>
          )
        })}
      </nav>

      {/* User footer */}
      <div className={cn('border-t border-border/30 p-3 shrink-0', slim && 'flex flex-col items-center gap-2')}>
        {!slim && (
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.image ?? ''} />
              <AvatarFallback className="bg-primary/20 text-primary font-semibold uppercase text-xs">
                {user.name?.[0]?.toUpperCase() ?? 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
        {slim && (
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.image ?? ''} />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold uppercase text-xs">
              {user.name?.[0]?.toUpperCase() ?? 'A'}
            </AvatarFallback>
          </Avatar>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={cn('w-full justify-start text-xs text-muted-foreground hover:text-destructive gap-1.5', slim && 'justify-center px-0')}
          onClick={() => signOut({ callbackUrl: '/' })}
          title={slim ? 'Sign Out' : undefined}
        >
          <LogOut className="w-3.5 h-3.5" />
          {!slim && 'Sign Out'}
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden flex items-center justify-between px-3 h-14 bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center gradient-bg-primary">
            <Shield className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="gradient-text font-black text-lg font-display">Admin Panel</span>
        </Link>
        <div className="flex items-center gap-1">
          {/* Bell */}
          <Link href="/admin/announcements" className="relative">
            <Button variant="ghost" size="icon" className="w-9 h-9 text-muted-foreground" aria-label="Announcements">
              <Bell className="w-4 h-4" />
            </Button>
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 right-0 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </Link>
          {/* Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full outline-none ring-2 ring-border/50">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.image ?? ''} />
                  <AvatarFallback className="bg-primary/20 text-primary font-semibold uppercase text-xs">
                    {user.name?.[0]?.toUpperCase() ?? 'A'}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border-border/50">
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="text-xs cursor-pointer">Member Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs text-destructive cursor-pointer" onClick={() => signOut({ callbackUrl: '/' })}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="w-9 h-9" aria-label="Open admin sidebar">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 flex flex-col bg-card border-r border-border/50">
              <SheetTitle className="sr-only">Admin Menu</SheetTitle>
              <SidebarInner />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop — controlled by parent collapse state */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-screen bg-card border-r border-border/50 sticky top-0 sidebar-transition relative',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        <SidebarInner slim={collapsed} />
      </aside>
    </>
  )
}
