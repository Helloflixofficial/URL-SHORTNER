import Navbar from '@/components/front/navbar'
import Footer from '@/components/front/footer'

export default function FrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
