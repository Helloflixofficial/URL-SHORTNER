import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export default async function ReferralPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true }
  })

  if (user) {
    const cookieStore = await cookies()
    cookieStore.set('ref_id', user.id, { 
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/' 
    })
  }

  redirect('/register')
}
