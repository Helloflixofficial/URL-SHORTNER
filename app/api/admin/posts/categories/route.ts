import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'
import { auth } from '@/lib/auth'

async function getSession(req: NextRequest) {
  const adminSession = await requireAdminSession()
  if (adminSession) return { authorized: true }
  const memberSession = await auth()
  if (memberSession?.user?.id) return { authorized: true }
  return { authorized: false }
}

export async function GET(req: NextRequest) {
  const { authorized } = await getSession(req)
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const categories = await prisma.postCategory.findMany({
    orderBy: { name: 'asc' },
  })
  return NextResponse.json({ categories })
}

export async function POST(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized — admin only' }, { status: 401 })
  }

  try {
    const { name } = await req.json()
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const trimmed = name.trim().slice(0, 100)
    const slug = trimmed.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    const existing = await prisma.postCategory.findUnique({ where: { slug } })
    if (existing) return NextResponse.json({ error: 'Category already exists' }, { status: 409 })

    const category = await prisma.postCategory.create({
      data: { name: trimmed, slug },
    })
    return NextResponse.json({ success: true, category })
  } catch (err) {
    console.error('[POST /api/admin/posts/categories] Error:', err instanceof Error ? err.message : 'Unknown')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
