import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as Record<string, string>

  // Upsert all provided keys
  await Promise.all(
    Object.entries(body).map(([key, value]) =>
      prisma.option.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  )

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const options = await prisma.option.findMany()
  const result: Record<string, string> = {}
  options.forEach(o => { result[o.key] = o.value })
  return NextResponse.json(result)
}
