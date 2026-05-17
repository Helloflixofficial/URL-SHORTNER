'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'

interface Props {
  methods: any[]
}

export default function AddFundsForm({ methods }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('10')
  const [method, setMethod] = useState(methods[0]?.key || 'paypal')
  const [txnId, setTxnId] = useState('')

  const selectedMethod = methods.find(m => m.key === method)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const min = selectedMethod?.minAmount || 5
    if (parseFloat(amount) < min) return toast.error(`Minimum deposit for ${selectedMethod?.name || 'this method'} is $${min}`)
    if (!txnId) return toast.error('Please enter Transaction ID or Proof')

    setLoading(true)
    try {
      const res = await fetch('/api/invoices/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), method, txnId })
      })
      if (!res.ok) throw new Error()
      toast.success('Deposit request submitted! Waiting for admin approval.')
      router.push('/invoices')
      router.refresh()
    } catch {
      toast.error('Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Deposit Amount (USD)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input 
            type="number" 
            min={selectedMethod?.minAmount || 5}
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="pl-7 glass border-border/50 h-11" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Payment Method</Label>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="glass border-border/50 h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass border-border/50">
            {methods.map(m => (
              <SelectItem key={m.id} value={m.key}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedMethod?.details && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
          <p className="text-[10px] font-bold uppercase text-primary">Instructions</p>
          <div className="text-xs text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedMethod.details }} />
        </div>
      )}

      <div className="space-y-2">
        <Label>{selectedMethod?.inputLabel || 'Transaction ID / Proof Details'}</Label>
        <Input 
          placeholder="Enter details here..." 
          value={txnId}
          onChange={e => setTxnId(e.target.value)}
          className="glass border-border/50 h-11" 
        />
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full btn-glow gradient-bg-primary text-primary-foreground h-11"
      >
        {loading ? 'Submitting...' : <><Send className="w-4 h-4 mr-2" /> Submit Request</>}
      </Button>
    </form>
  )
}
