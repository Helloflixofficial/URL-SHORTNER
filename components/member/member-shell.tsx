'use client'
import { SidebarProvider, useSidebar } from '@/components/providers/sidebar-provider'
import DashboardSidebar from '@/components/member/sidebar'
import MemberTopbar from '@/components/member/topbar'
import { ReactNode } from 'react'

interface MemberShellProps {
  user: { name?: string | null; email?: string | null; image?: string | null; role?: string }
  balance: number
  children: ReactNode
}

function InnerShell({ user, balance, children }: MemberShellProps) {
  const { collapsed, toggle, setCollapsed } = useSidebar()

  return (
    <div className="h-screen w-full flex overflow-hidden bg-background">
      <DashboardSidebar
        user={user}
        balance={balance}
        collapsed={collapsed}
        onCollapseChange={setCollapsed}
      />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <MemberTopbar
          user={user}
          balance={balance}
          onToggleSidebar={toggle}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function MemberShell({ user, balance, children }: MemberShellProps) {
  return (
    <SidebarProvider storageKey="member-sidebar-collapsed">
      <InnerShell user={user} balance={balance}>
        {children}
      </InnerShell>
    </SidebarProvider>
  )
}
