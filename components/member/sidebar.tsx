'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Link2, BarChart3, Megaphone, CreditCard,
  ArrowDownToLine, Settings, LogOut, ChevronRight, Zap, Users, MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/statistics', icon: BarChart3, label: 'Statistics' },
  { href: '/links', icon: Link2, label: 'My Links' },
  { href: '/referrals', icon: Users, label: 'Referrals' },
  { href: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { href: '/withdrawals', icon: ArrowDownToLine, label: 'Withdrawals' },
  { href: '/invoices', icon: CreditCard, label: 'Invoices' },
  { href: '/tickets', icon: MessageSquare, label: 'Support' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null; role?: string }
  balance: number
}

export default function DashboardSidebar({ user, balance }: SidebarProps) {
  const pathname = usePathname()

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-border/30">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-bg-primary">
            <Link2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="gradient-text font-black text-xl font-display">Linksite</span>
        </Link>
      </div>

      {/* Balance card */}
      <div className="p-4">
        <div className="rounded-xl p-4 border border-primary/20 gradient-bg-card">
          <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
          <p className="text-2xl font-black gradient-text font-display">
            ${balance.toFixed(2)}
          </p>
          <Button asChild size="sm" className="w-full mt-3 h-8 text-xs btn-glow gradient-bg-primary text-primary-foreground">
            <Link href="/withdrawals"><ArrowDownToLine className="w-3 h-3 mr-1" />Withdraw</Link>
          </Button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150',
                active
                  ? 'sidebar-item-active text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5" />}
            </Link>
          )
        })}
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-border/30">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-9 h-9">
            <AvatarImage src={user.image ?? ''} />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold uppercase text-sm">
              {user.name?.[0]?.toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          {user.role === 'admin' && <Badge className="text-xs px-1.5 py-0 gradient-bg-primary text-primary-foreground">Admin</Badge>}
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground hover:text-destructive gap-2"
          onClick={() => signOut({ callbackUrl: '/' })}>
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Nav Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-bg-primary">
            <Link2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="gradient-text font-black text-xl font-display">Linksite</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Open sidebar menu">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col bg-card border-r border-border/50">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen bg-card border-r border-border/50 flex-col sticky top-0">
        <SidebarContent />
      </aside>
    </>
  )
}
