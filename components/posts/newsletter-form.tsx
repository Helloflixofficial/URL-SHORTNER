'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Simulate API submission
      await new Promise((resolve) => setTimeout(resolve, 800))
      toast.success('Thank you for subscribing to our newsletter!')
      setEmail('')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="bg-[#f6f5f2] border-[#dedcd6] text-xs h-9 rounded-xl placeholder:text-muted-foreground text-slate-800 focus-visible:ring-violet-500"
        required
      />
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1a1a19] hover:bg-neutral-800 text-white text-xs h-9 rounded-xl font-bold transition-all duration-200 active:scale-[0.98]"
      >
        {loading ? 'Subscribing...' : 'Subscribe'}
      </Button>
    </form>
  )
}
