import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const DATANODES_BASE = process.env.DATANODES_API_BASE ?? 'https://datanodes.to'
const DATANODES_KEY = process.env.DATANODES_API_KEY

async function requireAdminSession() {
  const session = await auth()
  if (!session?.user) return null
  const role = (session.user as { role?: string }).role
  if (role !== 'admin' && role !== 'owner') return null
  return session
}

// GET /api/uploads/deleted — list recently deleted files
export async function GET() {
  const session = await requireAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!DATANODES_KEY) {
    return NextResponse.json({ error: 'DataNodes API key not configured' }, { status: 500 })
  }

  try {
    const url = new URL(`${DATANODES_BASE}/api/files/deleted`)
    url.searchParams.set('key', DATANODES_KEY)
    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) throw new Error(`DataNodes responded with ${res.status}`)
    return NextResponse.json(await res.json())
  } catch (err) {
    console.error('[uploads/deleted GET] DataNodes error:', err)
    return NextResponse.json({ error: 'Failed to fetch deleted files' }, { status: 502 })
  }
}
