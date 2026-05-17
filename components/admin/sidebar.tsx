'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Users, Link2, Megaphone, ArrowDownToLine,
  CreditCard, FileText, BookOpen, MessageSquare, Star,
  Settings, LogOut, ChevronRight, Shield, TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/links', icon: Link2, label: 'Links' },
  { href: '/admin/campaigns', icon: Megaphone, label: 'Campaigns' },
  { href: '/admin/withdrawals', icon: ArrowDownToLine, label: 'Withdrawals' },
  { href: '/admin/payout-rates', icon: TrendingUp, label: 'Payout Rates' },
  { href: '/admin/invoices', icon: FileText, label: 'Deposits' },
  { href: '/admin/plans', icon: CreditCard, label: 'Plans' },
  { href: '/admin/tickets', icon: MessageSquare, label: 'Support Tickets' },
  { href: '/admin/posts', icon: BookOpen, label: 'Blog Posts' },
  { href: '/admin/pages', icon: FileText, label: 'Pages' },
  { href: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
  { href: '/admin/testimonials', icon: Star, label: 'Testimonials' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null }
}

export default function AdminSidebar({ user }: Props) {
  const pathname = usePathname()

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-border/30">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center gradient-bg-primary">
            <Shield className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="gradient-text font-black text-lg font-display">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                active ? 'sidebar-item-active text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border/30">
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
        <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground hover:text-destructive gap-1.5"
          onClick={() => signOut({ callbackUrl: '/' })}>
          <LogOut className="w-3 h-3" /> Sign Out
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Nav Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center gradient-bg-primary">
            <Shield className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="gradient-text font-black text-lg font-display">Admin</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Open admin sidebar">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 flex flex-col bg-card border-r border-border/50">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 min-h-screen bg-card border-r border-border/50 flex-col sticky top-0">
        <SidebarContent />
      </aside>
    </>
  )
}
