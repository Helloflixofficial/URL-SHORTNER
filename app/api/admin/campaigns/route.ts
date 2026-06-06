import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'

export async function POST(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, status } = await req.json() // 1=Active, 4=Rejected
    
    const campaign = await prisma.campaign.findUnique({ 
      where: { id },
      select: { userId: true, budget: true, status: true } 
    })
    
    if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.campaign.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Campaign process error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
