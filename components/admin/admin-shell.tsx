'use client'
import { SidebarProvider, useSidebar } from '@/components/providers/sidebar-provider'
import AdminSidebar from '@/components/admin/sidebar'
import AdminTopbar from '@/components/admin/topbar'
import { ReactNode } from 'react'

interface AdminShellProps {
  user: { name?: string | null; email?: string | null; image?: string | null; role?: string }
  pendingCount?: number
  children: ReactNode
}

function InnerShell({ user, pendingCount, children }: AdminShellProps) {
  const { collapsed, toggle, setCollapsed } = useSidebar()

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-background">
      <AdminSidebar
        user={user}
        collapsed={collapsed}
        onCollapseChange={setCollapsed}
        pendingCount={pendingCount}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopbar
          user={user}
          pendingCount={pendingCount}
          onToggleSidebar={toggle}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AdminShell({ user, pendingCount, children }: AdminShellProps) {
  return (
    <SidebarProvider storageKey="admin-sidebar-collapsed">
      <InnerShell user={user} pendingCount={pendingCount}>
        {children}
      </InnerShell>
    </SidebarProvider>
  )
}
