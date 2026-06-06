import Navbar from '@/components/front/navbar'

export default function FrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Navbar />
      <main className="flex-1 min-h-0 relative overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
