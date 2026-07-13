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

function buildUrl(path: string, params: Record<string, string> = {}) {
  if (!DATANODES_KEY) throw new Error('DATANODES_API_KEY is not configured')
  const url = new URL(`${DATANODES_BASE}${path}`)
  url.searchParams.set('key', DATANODES_KEY)
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') url.searchParams.set(k, v)
  }
  return url.toString()
}

// GET /api/uploads/folders?fld_id=0 — list folder contents
export async function GET(req: NextRequest) {
  const session = await requireAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const fldId = req.nextUrl.searchParams.get('fld_id') ?? '0'
  if (!/^\d+$/.test(fldId)) {
    return NextResponse.json({ error: 'Invalid folder ID' }, { status: 400 })
  }

  try {
    const res = await fetch(buildUrl('/api/folder/list', { fld_id: fldId }), { cache: 'no-store' })
    if (!res.ok) throw new Error(`DataNodes responded with ${res.status}`)
    return NextResponse.json(await res.json())
  } catch (err) {
    console.error('[uploads/folders GET] DataNodes error:', err)
    return NextResponse.json({ error: 'Failed to list folder' }, { status: 502 })
  }
}

// POST /api/uploads/folders — create a folder
// Body: { parent_id?: string, name: string }
export async function POST(req: NextRequest) {
  const session = await requireAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { parent_id?: string; name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parentId = body.parent_id ?? '0'
  const name = body.name ?? ''

  if (!/^\d+$/.test(parentId)) {
    return NextResponse.json({ error: 'Invalid parent folder ID' }, { status: 400 })
  }
  if (!name || name.trim().length === 0 || name.length > 255) {
    return NextResponse.json({ error: 'Invalid folder name' }, { status: 400 })
  }
  const safeName = name.replace(/[/\\<>:"|?*]/g, '_').trim()

  try {
    const res = await fetch(buildUrl('/api/folder/create', { parent_id: parentId, name: safeName }), {
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`DataNodes responded with ${res.status}`)
    return NextResponse.json(await res.json())
  } catch (err) {
    console.error('[uploads/folders POST] DataNodes error:', err)
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 502 })
  }
}

// PATCH /api/uploads/folders — rename a folder
// Body: { fld_id: string, name: string }
export async function PATCH(req: NextRequest) {
  const session = await requireAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { fld_id?: string; name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const fldId = body.fld_id ?? ''
  const name = body.name ?? ''

  if (!/^\d+$/.test(fldId)) {
    return NextResponse.json({ error: 'Invalid folder ID' }, { status: 400 })
  }
  if (!name || name.trim().length === 0 || name.length > 255) {
    return NextResponse.json({ error: 'Invalid folder name' }, { status: 400 })
  }
  const safeName = name.replace(/[/\\<>:"|?*]/g, '_').trim()

  try {
    const res = await fetch(buildUrl('/api/folder/rename', { fld_id: fldId, name: safeName }), {
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`DataNodes responded with ${res.status}`)
    return NextResponse.json(await res.json())
  } catch (err) {
    console.error('[uploads/folders PATCH] DataNodes error:', err)
    return NextResponse.json({ error: 'Failed to rename folder' }, { status: 502 })
  }
}
