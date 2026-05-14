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

interface Props { balance: number; minWithdrawal: number }

export default function WithdrawalForm({ balance, minWithdrawal }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('paypal')
  const [accountDetails, setAccountDetails] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt < minWithdrawal) { toast.error(`Minimum withdrawal is $${minWithdrawal}`); return }
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
      setAmount(''); setAccountDetails('')
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
              <Select value={method} onValueChange={(v) => setMethod(v || 'paypal')}>
                <SelectTrigger className="h-11 glass border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent className="glass border-border">
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Account Details</Label>
            <Textarea value={accountDetails} onChange={e => setAccountDetails(e.target.value)}
              placeholder={method === 'paypal' ? 'Your PayPal email address' : method === 'bank' ? 'Bank name, account number, routing number' : 'Wallet address and network'}
              className="glass border-border/50 resize-none" rows={3} />
          </div>
          <Button type="submit" disabled={loading || balance < minWithdrawal}
            className="btn-glow font-semibold" style={{ background: 'var(--gradient-primary)' }}>
            {loading ? 'Submitting...' : 'Request Withdrawal'}
          </Button>
          {balance < minWithdrawal && (
            <p className="text-xs text-muted-foreground">Minimum balance of ${minWithdrawal} required</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
