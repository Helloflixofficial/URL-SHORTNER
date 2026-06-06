'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Link2, BarChart3, Megaphone, CreditCard,
  ArrowDownToLine, Settings, LogOut, Zap, Users, MessageSquare, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Menu, DollarSign } from 'lucide-react'

const navSections = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
      { href: '/statistics', icon: BarChart3, label: 'Statistics' },
    ],
  },
  {
    label: 'Links',
    items: [
      { href: '/links', icon: Link2, label: 'My Links' },
      { href: '/campaigns', icon: Megaphone, label: 'Campaigns' },
      { href: '/tools', icon: Zap, label: 'Tools' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/withdrawals', icon: ArrowDownToLine, label: 'Withdrawals' },
      { href: '/invoices', icon: CreditCard, label: 'Invoices' },
      { href: '/referrals', icon: Users, label: 'Referrals' },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/tickets', icon: MessageSquare, label: 'Support' },
      { href: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

interface SidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null; role?: string }
  balance: number
  collapsed?: boolean
  onCollapseChange?: (v: boolean) => void
}

export default function DashboardSidebar({ user, balance, collapsed = false, onCollapseChange }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href)

  const SidebarInner = ({ slim }: { slim?: boolean }) => (
    <>
      {/* Logo */}
      <div className={cn('flex items-center border-b border-border/30 shrink-0', slim ? 'h-14 justify-center px-2' : 'h-14 px-4 gap-2')}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-bg-primary shrink-0">
          <Link2 className="w-4 h-4 text-primary-foreground" />
        </div>
        {!slim && <span className="gradient-text font-black text-xl font-display">Linksite</span>}
        {!slim && onCollapseChange && (
          <button
            onClick={() => onCollapseChange(true)}
            className="ml-auto w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
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

      {/* Balance chip (hidden when slim) */}
      {!slim && (
        <div className="px-4 py-3">
          <div className="rounded-xl p-3.5 border border-primary/20 gradient-bg-card">
            <p className="text-xs text-muted-foreground mb-0.5">Available Balance</p>
            <p className="text-xl font-black gradient-text font-display">${balance.toFixed(2)}</p>
            <Button asChild size="sm" className="w-full mt-2.5 h-7 text-xs btn-glow gradient-bg-primary text-primary-foreground">
              <Link href="/withdrawals"><ArrowDownToLine className="w-3 h-3 mr-1" />Withdraw</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            {!slim && <p className="nav-section-label">{section.label}</p>}
            {slim && <div className="h-px bg-border/30 mx-3 my-1.5" />}
            {section.items.map((item) => {
              const active = isActive(item.href, (item as { exact?: boolean }).exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={slim ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 mx-2 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150',
                    slim && 'justify-center',
                    active
                      ? 'sidebar-item-active text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!slim && <span className="flex-1">{item.label}</span>}
                  {!slim && active && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className={cn('border-t border-border/30 p-3 shrink-0', slim && 'flex flex-col items-center gap-2')}>
        {!slim && (
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="w-9 h-9">
              <AvatarImage src={user.image ?? ''} />
              <AvatarFallback className="bg-primary/20 text-primary font-semibold uppercase text-sm">
                {user.name?.[0]?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                {(user.role === 'admin' || user.role === 'owner') && (
                  <Badge className="text-xs px-1.5 py-0 gradient-bg-primary text-primary-foreground">
                    {user.role === 'owner' ? 'Owner' : 'Admin'}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
        {slim && (
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.image ?? ''} />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold uppercase text-xs">
              {user.name?.[0]?.toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={cn('w-full justify-start text-xs text-muted-foreground hover:text-destructive gap-2', slim && 'justify-center px-0')}
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
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between px-3 h-14 bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-bg-primary">
            <Link2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="gradient-text font-black text-xl font-display">Linksite</span>
        </Link>
        <div className="flex items-center gap-1">
          {/* Balance chip */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-primary/20 gradient-bg-card text-xs font-semibold">
            <DollarSign className="w-3 h-3 text-primary" />
            <span className="gradient-text">${balance.toFixed(2)}</span>
          </div>
          {/* Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full outline-none ring-2 ring-border/50 ml-0.5">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.image ?? ''} />
                  <AvatarFallback className="bg-primary/20 text-primary font-semibold uppercase text-xs">
                    {user.name?.[0]?.toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border-border/50">
              <DropdownMenuItem asChild>
                <Link href="/settings" className="text-xs cursor-pointer">Settings</Link>
              </DropdownMenuItem>
              {(user.role === 'admin' || user.role === 'owner') && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="text-xs cursor-pointer text-primary">Admin Panel</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs text-destructive cursor-pointer" onClick={() => signOut({ callbackUrl: '/' })}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="w-9 h-9" aria-label="Open sidebar menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 flex flex-col bg-card border-r border-border/50">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SidebarInner />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-screen bg-[#0c101b]/40 backdrop-blur-xl border-r border-white/[0.06] sticky top-0 sidebar-transition relative shadow-[4px_0_24px_rgba(0,0,0,0.15)]',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <SidebarInner slim={collapsed} />
      </aside>
    </>
  )
}
