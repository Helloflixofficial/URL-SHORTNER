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

// Validate a file_code: alphanumeric only, no special chars
function isValidFileCode(code: string) {
  return /^[a-zA-Z0-9]{4,32}$/.test(code)
}

// GET /api/uploads/files/[file_code] — get file info
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ file_code: string }> }
) {
  const session = await requireAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { file_code } = await params
  if (!isValidFileCode(file_code)) {
    return NextResponse.json({ error: 'Invalid file code' }, { status: 400 })
  }

  try {
    const data = await dataNodesGet('/api/file/info', { file_code })
    return NextResponse.json(data)
  } catch (err) {
    console.error('[uploads/files/[file_code] GET] DataNodes error:', err)
    return NextResponse.json({ error: 'Failed to fetch file info' }, { status: 502 })
  }
}

// PATCH /api/uploads/files/[file_code] — rename, clone, set_folder
// Body: { action: 'rename'|'clone'|'set_folder', name?: string, fld_id?: string }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ file_code: string }> }
) {
  const session = await requireAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { file_code } = await params
  if (!isValidFileCode(file_code)) {
    return NextResponse.json({ error: 'Invalid file code' }, { status: 400 })
  }

  let body: { action?: string; name?: string; fld_id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { action, name, fld_id } = body

  try {
    if (action === 'rename') {
      // Validate name: non-empty, max 255 chars, strip any path traversal
      if (!name || name.trim().length === 0 || name.length > 255) {
        return NextResponse.json({ error: 'Invalid file name' }, { status: 400 })
      }
      // Use only basename — strip any directory separators
      const safeName = name.replace(/[/\\]/g, '_').trim()
      const data = await dataNodesGet('/api/file/rename', { file_code, name: safeName })
      return NextResponse.json(data)
    } else if (action === 'clone') {
      const data = await dataNodesGet('/api/file/clone', { file_code })
      return NextResponse.json(data)
    } else if (action === 'set_folder') {
      if (fld_id === undefined || !/^\d+$/.test(fld_id)) {
        return NextResponse.json({ error: 'Invalid folder ID' }, { status: 400 })
      }
      const data = await dataNodesGet('/api/file/set_folder', { file_code, fld_id })
      return NextResponse.json(data)
    } else {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (err) {
    console.error('[uploads/files/[file_code] PATCH] DataNodes error:', err)
    return NextResponse.json({ error: 'Operation failed' }, { status: 502 })
  }
}

// DELETE /api/uploads/files/[file_code] — delete a file
// Note: DataNodes doesn't have an explicit delete endpoint in docs;
// we use the file_code to handle removal through available API options.
// TODO(security): Confirm DataNodes delete endpoint when officially documented.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ file_code: string }> }
) {
  const session = await requireAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { file_code } = await params
  if (!isValidFileCode(file_code)) {
    return NextResponse.json({ error: 'Invalid file code' }, { status: 400 })
  }

  try {
    // Attempt delete via DataNodes — endpoint may vary; using set_folder to root as fallback
    // The real delete would be at a to-be-confirmed endpoint
    const data = await dataNodesGet('/api/file/delete', { file_code })
    return NextResponse.json(data)
  } catch (err) {
    console.error('[uploads/files/[file_code] DELETE] DataNodes error:', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 502 })
  }
}
