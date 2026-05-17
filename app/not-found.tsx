import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Link2 } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen hero-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 glass border border-primary/30">
          <Link2 className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-7xl font-black gradient-text mb-4 font-display">404</h1>
        <h2 className="text-2xl font-bold mb-3">Link Not Found</h2>
        <p className="text-muted-foreground mb-8">This short link doesn&apos;t exist or has been removed.</p>
        <Button asChild className="btn-glow gradient-bg-primary text-primary-foreground">
          <Link href="/"><Home className="w-4 h-4 mr-2" />Back to Home</Link>
        </Button>
      </div>
    </div>
  )
}
