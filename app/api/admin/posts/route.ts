import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, content, excerpt, slug } = await req.json()
    if (!title || !content || !slug) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const post = await prisma.post.create({
      data: {
        title,
        content,
        excerpt,
        slug,
        published: true
      }
    })

    return NextResponse.json({ success: true, id: post.id })
  } catch (err) {
    console.error('Create post error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
