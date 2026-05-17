import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Wallet, Landmark, Bitcoin } from 'lucide-react'
import AddFundsForm from '@/components/member/add-funds-form'

export const metadata = { title: 'Add Funds — Linksite' }

const iconMap = {
  paypal: CreditCard,
  payeer: Wallet,
  bank: Landmark,
  crypto: Bitcoin,
}

export default async function AddFundsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const methods = await prisma.paymentMethod.findMany({
    where: { isEnabled: true, type: { in: ['deposit', 'both'] } },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black font-display">
          Add <span className="gradient-text">Funds</span>
        </h1>
        <p className="text-muted-foreground mt-1">Fund your account to start creating campaigns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((m) => {
          const Icon = iconMap[m.key as keyof typeof iconMap] || CreditCard
          return (
            <Card key={m.id} className="glass border-border/50 hover:border-primary/30 transition-all cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-primary`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{m.name}</p>
                  <p className="text-[10px] text-muted-foreground">Min: ${m.minAmount}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="glass border-border/50">
        <CardHeader><CardTitle>Deposit Details</CardTitle></CardHeader>
        <CardContent>
          <AddFundsForm methods={methods} />
        </CardContent>
      </Card>

      <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
        <h4 className="text-sm font-bold text-amber-500 mb-2 flex items-center gap-2">
          <Landmark className="w-4 h-4" /> Important Note
        </h4>
        <p className="text-xs text-amber-500/80 leading-relaxed">
          Deposits are processed manually. After sending the payment according to the instructions of your chosen method, please provide the transaction details. Your balance will be updated within 1-24 hours.
        </p>
      </div>
    </div>
  )
}
