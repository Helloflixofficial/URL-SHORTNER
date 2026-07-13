import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

const DATANODES_BASE = process.env.DATANODES_API_BASE ?? 'https://datanodes.to'
const DATANODES_KEY = process.env.DATANODES_API_KEY

async function requireAdminSession() {
  const session = await auth()
  if (!session?.user) return null
  const role = (session.user as { role?: string }).role
  if (role !== 'admin' && role !== 'owner') return null
  return session
}

// GET /api/uploads/download?file_code=... — generate a direct download link
export async function GET(req: NextRequest) {
  const session = await requireAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const fileCode = req.nextUrl.searchParams.get('file_code')
  if (!fileCode || !/^[a-zA-Z0-9]{4,32}$/.test(fileCode)) {
    return NextResponse.json({ error: 'Invalid file code' }, { status: 400 })
  }

  if (!DATANODES_KEY) {
    return NextResponse.json({ error: 'DataNodes API key not configured' }, { status: 500 })
  }

  try {
    const url = new URL(`${DATANODES_BASE}/api/file/direct_link`)
    url.searchParams.set('key', DATANODES_KEY)
    url.searchParams.set('file_code', fileCode)

    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) throw new Error(`DataNodes responded with ${res.status}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[uploads/download GET] DataNodes error:', err)
    return NextResponse.json({ error: 'Failed to generate download link' }, { status: 502 })
  }
}
