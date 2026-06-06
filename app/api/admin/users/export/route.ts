import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'

export async function GET(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''

  const users = await prisma.user.findMany({
    where: q ? {
      OR: [
        { username: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ],
    } : undefined,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      status: true,
      balance: true,
      totalEarned: true,
      createdAt: true,
      country: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  // Build CSV
  const headers = ['ID', 'Username', 'Email', 'Role', 'Status', 'Balance', 'Total Earned', 'Country', 'Joined Date']
  const csvRows = [
    headers.join(','),
    ...users.map(u => [
      u.id,
      `"${u.username}"`,
      `"${u.email}"`,
      u.role,
      u.status,
      u.balance.toFixed(4),
      u.totalEarned.toFixed(4),
      `"${u.country || ''}"`,
      u.createdAt.toISOString()
    ].join(','))
  ]

  const csvContent = csvRows.join('\n')

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
