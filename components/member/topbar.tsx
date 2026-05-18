'use client'
import { Bell, DollarSign } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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

interface MemberTopbarProps {
  user: { name?: string | null; email?: string | null; image?: string | null; role?: string }
  balance?: number
  onToggleSidebar?: () => void
}

export default function MemberTopbar({ user, balance, onToggleSidebar }: MemberTopbarProps) {
  return (
    <div className="topbar w-full">
      {/* Left: sidebar toggle */}
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

        {/* Balance quick chip */}
        {balance !== undefined && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 gradient-bg-card text-xs font-semibold">
            <DollarSign className="w-3 h-3 text-primary" />
            <span className="gradient-text">${balance.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Right: bell + avatar */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Bell */}
        <Link href="/tickets">
          <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground" aria-label="Support tickets">
            <Bell className="w-4 h-4" />
          </Button>
        </Link>

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full outline-none ring-2 ring-border/50 hover:ring-primary/50 transition-all">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.image ?? ''} />
                <AvatarFallback className="bg-primary/20 text-primary font-semibold uppercase text-xs">
                  {user.name?.[0]?.toUpperCase() ?? 'U'}
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
              <Link href="/settings" className="text-xs cursor-pointer">Profile Settings</Link>
            </DropdownMenuItem>
            {user.role === 'admin' && (
              <DropdownMenuItem asChild>
                <Link href="/admin" className="text-xs cursor-pointer text-primary">Admin Panel</Link>
              </DropdownMenuItem>
            )}
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
