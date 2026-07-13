import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

const DATANODES_BASE = process.env.DATANODES_API_BASE ?? 'https://datanodes.to'
const DATANODES_KEY = process.env.DATANODES_API_KEY

async function dataNodesGet(path: string, params: Record<string, string> = {}) {
  if (!DATANODES_KEY) throw new Error('DATANODES_API_KEY is not configured')
  const url = new URL(`${DATANODES_BASE}${path}`)
  url.searchParams.set('key', DATANODES_KEY)
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') url.searchParams.set(k, v)
  }
  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) throw new Error(`DataNodes responded with ${res.status}`)
  return res.json()
}

async function requireAdminSession() {
  const session = await auth()
  if (!session?.user) return null
  const role = (session.user as { role?: string }).role
  if (role !== 'admin' && role !== 'owner') return null
  return session
}

// GET /api/uploads/files?page=1&per_page=20&fld_id=0&name=&public=
export async function GET(req: NextRequest) {
  const session = await requireAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sp = req.nextUrl.searchParams
  const page = sp.get('page') ?? '1'
  const per_page = sp.get('per_page') ?? '20'
  const fld_id = sp.get('fld_id') ?? '0'
  const name = sp.get('name') ?? ''
  const pub = sp.get('public') ?? ''

  // Validate: page and per_page must be positive integers
  if (!/^\d+$/.test(page) || !/^\d+$/.test(per_page) || !/^\d*$/.test(fld_id)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  try {
    const data = await dataNodesGet('/api/file/list', { page, per_page, fld_id, name, public: pub })
    return NextResponse.json(data)
  } catch (err) {
    console.error('[uploads/files GET] DataNodes error:', err)
    return NextResponse.json({ error: 'Failed to fetch file list' }, { status: 502 })
  }
}
