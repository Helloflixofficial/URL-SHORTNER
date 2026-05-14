'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Users, Link2, Megaphone, ArrowDownToLine,
  CreditCard, FileText, BookOpen, MessageSquare, Star,
  Settings, LogOut, ChevronRight, Shield,
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
  { href: '/admin/plans', icon: CreditCard, label: 'Plans' },
  { href: '/admin/posts', icon: BookOpen, label: 'Blog Posts' },
  { href: '/admin/pages', icon: FileText, label: 'Pages' },
  { href: '/admin/announcements', icon: MessageSquare, label: 'Announcements' },
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
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="gradient-text font-black text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Admin</span>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                active ? 'sidebar-item-active text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-white/5',
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
            <AvatarFallback style={{ background: 'var(--gradient-primary)' }} className="text-white text-xs font-bold">
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
      <div className="md:hidden flex items-center justify-between p-4 glass border-b border-border/50 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="gradient-text font-black text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Admin</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 flex flex-col glass border-r border-border/50">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 min-h-screen glass border-r border-border/50 flex-col sticky top-0">
        <SidebarContent />
      </aside>
    </>
  )
}
