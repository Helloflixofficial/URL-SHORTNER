import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  try {
    const { name } = await req.json()
    if (!name || typeof name !== 'string') return NextResponse.json({ error: 'Name required' }, { status: 400 })

    const trimmed = name.trim().slice(0, 100)
    const slug = trimmed.toLowerCase()
      .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')

    const category = await prisma.postCategory.update({
      where: { id },
      data: { name: trimmed, slug },
    })
    return NextResponse.json({ success: true, category })
  } catch (err) {
    console.error('[PATCH /api/admin/posts/categories/[id]] Error:', err instanceof Error ? err.message : 'Unknown')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  try {
    // Unset category on all posts first
    await prisma.post.updateMany({ where: { categoryId: id }, data: { categoryId: null } })
    await prisma.postCategory.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/posts/categories/[id]] Error:', err instanceof Error ? err.message : 'Unknown')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
