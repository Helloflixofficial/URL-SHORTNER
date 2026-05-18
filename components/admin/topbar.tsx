'use client'
import { Bell, Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

interface AdminTopbarProps {
  user: { name?: string | null; email?: string | null; image?: string | null }
  title?: string
  pendingCount?: number
  onToggleSidebar?: () => void
}

export default function AdminTopbar({ user, title, pendingCount = 0, onToggleSidebar }: AdminTopbarProps) {
  return (
    <div className="topbar w-full">
      {/* Left: sidebar toggle + title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
            aria-label="Toggle sidebar (Ctrl+B)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        {title && (
          <h1 className="text-sm font-semibold text-foreground truncate hidden sm:block">{title}</h1>
        )}
      </div>

      {/* Right: search + bell + avatar */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search (hidden on very small screens) */}
        <div className="relative hidden lg:flex items-center">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search…"
            className="pl-8 h-8 w-48 text-xs bg-muted/50 border-border/50"
          />
        </div>

        {/* Bell with badge */}
        <Link href="/admin/announcements" className="relative">
          <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground" aria-label="Announcements">
            <Bell className="w-4 h-4" />
          </Button>
          {pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </Link>

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full outline-none ring-2 ring-border/50 hover:ring-primary/50 transition-all">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.image ?? ''} />
                <AvatarFallback className="bg-primary/20 text-primary font-semibold uppercase text-xs">
                  {user.name?.[0]?.toUpperCase() ?? 'A'}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-card border-border/50">
            <DropdownMenuLabel className="text-xs">
              <p className="font-semibold">{user.name}</p>
              <p className="text-muted-foreground font-normal truncate">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="text-xs cursor-pointer">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/" className="text-xs cursor-pointer">View Site</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs text-destructive focus:text-destructive cursor-pointer"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
