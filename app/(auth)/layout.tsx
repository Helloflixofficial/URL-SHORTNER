import { Link2 } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen hero-bg flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      {/* Floating orbs */}
      <div className="fixed top-1/4 -left-10 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 rounded-full opacity-10 blur-3xl pointer-events-none gradient-bg-primary text-primary-foreground" />
      <div className="fixed bottom-1/4 -right-10 sm:right-10 w-40 sm:w-56 h-40 sm:h-56 rounded-full opacity-10 blur-3xl pointer-events-none gradient-bg-primary text-primary-foreground" />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-6 sm:mb-8">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center gradient-bg-primary text-primary-foreground">
          <Link2 className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="gradient-text font-black text-2xl">
          Linksite
        </span>
      </Link>

      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
