import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import MemberShell from '@/components/member/member-shell'

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  // DB freshness check — re-verify status/balance from database so banned
  // users cannot continue using the dashboard with a stale JWT.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id! },
    select: { balance: true, status: true },
  })

  // Redirect banned/inactive/deleted users immediately
  if (!user || user.status !== 'active') redirect('/login')

  return (
    <MemberShell
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: (session.user as { role?: string }).role,
      }}
      balance={user.balance}
    >
      {children}
    </MemberShell>
  )
}
