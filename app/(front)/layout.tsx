'use client'
import Navbar from '@/components/front/navbar'
import { usePathname } from 'next/navigation'

export default function FrontLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isBlogPage = pathname.startsWith('/blog')

  return (
    <>
      {!isBlogPage && <Navbar />}
      <main>
        {children}
      </main>
    </>
  )
}
