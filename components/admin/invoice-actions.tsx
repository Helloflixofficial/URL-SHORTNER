'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function AdminInvoiceActions({ invoiceId }: { invoiceId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleAction = async (status: number) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, status })
      })
      if (!res.ok) throw new Error()
      toast.success(`Invoice ${status === 1 ? 'approved' : 'rejected'} successfully`)
      router.refresh()
    } catch {
      toast.error('Failed to update invoice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button 
        size="icon-sm" 
        variant="outline" 
        onClick={() => handleAction(1)}
        disabled={loading}
        className="hover:bg-emerald-500/20 hover:text-emerald-500 border-border/50"
      >
        <Check className="w-3.5 h-3.5" />
      </Button>
      <Button 
        size="icon-sm" 
        variant="outline" 
        onClick={() => handleAction(2)}
        disabled={loading}
        className="hover:bg-red-500/20 hover:text-red-500 border-border/50"
      >
        <X className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}
