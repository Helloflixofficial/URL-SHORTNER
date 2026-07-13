import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const adminSession = await requireAdminSession()
  if (!adminSession) {
    const s = await auth()
    if (!s?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const tags = await prisma.postTag.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json({ tags })
}

export async function POST(req: NextRequest) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized — admin only' }, { status: 401 })

  try {
    const { name } = await req.json()
    if (!name || typeof name !== 'string') return NextResponse.json({ error: 'Name required' }, { status: 400 })

    const trimmed = name.trim().slice(0, 50)
    const slug = trimmed.toLowerCase()
      .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')

    const existing = await prisma.postTag.findUnique({ where: { slug } })
    if (existing) return NextResponse.json({ tag: existing })

    const tag = await prisma.postTag.create({ data: { name: trimmed, slug } })
    return NextResponse.json({ success: true, tag })
  } catch (err) {
    console.error('[POST /api/admin/posts/tags] Error:', err instanceof Error ? err.message : 'Unknown')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  try {
    await prisma.postTag.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/posts/tags] Error:', err instanceof Error ? err.message : 'Unknown')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
