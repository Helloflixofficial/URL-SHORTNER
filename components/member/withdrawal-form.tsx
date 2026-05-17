'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ArrowDownToLine } from 'lucide-react'

interface Props { 
  balance: number; 
  methods: any[];
  initialMethod?: string;
  initialAccount?: string;
}

export default function WithdrawalForm({ balance, methods, initialMethod, initialAccount }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState(initialMethod || methods[0]?.key || 'paypal')
  const [accountDetails, setAccountDetails] = useState(initialAccount || '')

  const selectedMethod = methods.find(m => m.key === method)
  const minWithdrawal = selectedMethod?.minAmount || 5

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt < minWithdrawal) { toast.error(`Minimum withdrawal for ${selectedMethod?.name || 'this method'} is $${minWithdrawal}`); return }
    if (amt > balance) { toast.error('Insufficient balance'); return }
    if (!accountDetails.trim()) { toast.error('Please enter account details'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, method, accountDetails }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Withdrawal request submitted!')
      setAmount(''); 
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit')
    } finally { setLoading(false) }
  }

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ArrowDownToLine className="w-5 h-5 text-primary" /> Request Withdrawal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Amount (USD)</Label>
              <Input type="number" min={minWithdrawal} max={balance} step="0.01"
                value={amount} onChange={e => setAmount(e.target.value)}
                placeholder={`Min $${minWithdrawal}`} className="h-11 glass border-border/50" />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <Select value={method} onValueChange={(v) => setMethod(v)}>
                <SelectTrigger className="h-11 glass border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent className="glass border-border">
                  {methods.map(m => (
                    <SelectItem key={m.id} value={m.key}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label>{selectedMethod?.inputLabel || 'Account Details'}</Label>
            <Textarea value={accountDetails} onChange={e => setAccountDetails(e.target.value)}
              placeholder="Enter your payout account details..."
              className="glass border-border/50 resize-none" rows={3} />
          </div>

          <Button type="submit" disabled={loading || balance < minWithdrawal}
            className="w-full btn-glow font-semibold gradient-bg-primary text-primary-foreground h-11">
            {loading ? 'Submitting...' : 'Request Withdrawal'}
          </Button>
          
          {balance < minWithdrawal && (
            <p className="text-xs text-muted-foreground text-center">Minimum balance of ${minWithdrawal} required for this method</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
