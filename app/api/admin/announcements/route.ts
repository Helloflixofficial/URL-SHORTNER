import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'

export async function POST(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, content, type } = await req.json()
    if (!title || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        type: type || 'info',
        published: true
      }
    })

    return NextResponse.json({ success: true, id: announcement.id })
  } catch (err) {
    console.error('Create announcement error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    await prisma.announcement.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete announcement error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
