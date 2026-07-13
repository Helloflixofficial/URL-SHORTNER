import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { HardDrive } from 'lucide-react'
import AccountWidget from '@/components/member/uploads/account-widget'
import UploadsClient from '@/components/member/uploads/uploads-client'

export const metadata = { title: 'Uploads — DataNodes' }

export default async function UploadsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const role = (session.user as { role?: string }).role
  if (role !== 'admin' && role !== 'owner') redirect('/dashboard')

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Page header ── */}
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gradient-bg-primary flex items-center justify-center shrink-0 mt-0.5">
          <HardDrive className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
        </span>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black font-display leading-tight">
            <span className="gradient-text">Uploads</span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 leading-snug">
            Upload, download, share &amp; organise files on DataNodes
          </p>
        </div>
      </div>

      {/* ── DataNodes account overview ── */}
      <section aria-label="DataNodes account overview">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2.5">
          Account Overview
        </p>
        <AccountWidget />
      </section>

      {/* ── File manager ── */}
      <section aria-label="File manager">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2.5">
          File Manager
        </p>
        <UploadsClient />
      </section>
    </div>
  )
}
