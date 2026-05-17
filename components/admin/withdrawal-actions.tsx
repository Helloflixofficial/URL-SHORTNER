'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Props { id: string }

export default function AdminWithdrawalAction({ id }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handle = async (status: number) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      if (!res.ok) throw new Error()
      toast.success(status === 1 ? 'Withdrawal approved' : 'Withdrawal rejected')
      router.refresh()
    } catch {
      toast.error('Action failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-1">
      <Button 
        size="icon" 
        variant="ghost" 
        className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/10" 
        disabled={loading}
        onClick={() => handle(1)}
      >
        <CheckCircle className="w-4 h-4" />
      </Button>
      <Button 
        size="icon" 
        variant="ghost" 
        className="h-8 w-8 text-red-400 hover:bg-red-500/10" 
        disabled={loading}
        onClick={() => handle(2)}
      >
        <XCircle className="w-4 h-4" />
      </Button>
    </div>
  )
}
