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

function dataNodesUrl(path: string, params: Record<string, string> = {}) {
  if (!DATANODES_KEY) throw new Error('DATANODES_API_KEY is not configured')
  const url = new URL(`${DATANODES_BASE}${path}`)
  url.searchParams.set('key', DATANODES_KEY)
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') url.searchParams.set(k, v)
  }
  return url.toString()
}

// GET /api/uploads/upload/url?url=... (queue) OR ?file_code=... (poll status)
export async function GET(req: NextRequest) {
  const session = await requireAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sp = req.nextUrl.searchParams
  const remoteUrl = sp.get('url')
  const fileCode = sp.get('file_code')
  const fldId = sp.get('fld_id') ?? '0'

  if (remoteUrl) {
    // Queue a remote URL upload
    // Validate: must be https URL
    try {
      const parsed = new URL(remoteUrl)
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return NextResponse.json({ error: 'Invalid URL protocol' }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    if (!/^\d+$/.test(fldId)) {
      return NextResponse.json({ error: 'Invalid folder ID' }, { status: 400 })
    }

    try {
      const res = await fetch(dataNodesUrl('/api/upload/url', { url: remoteUrl, fld_id: fldId }), {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`DataNodes responded with ${res.status}`)
      return NextResponse.json(await res.json())
    } catch (err) {
      console.error('[uploads/upload/url queue] DataNodes error:', err)
      return NextResponse.json({ error: 'Failed to queue remote upload' }, { status: 502 })
    }
  } else if (fileCode) {
    // Poll status of a queued upload
    if (!/^[a-zA-Z0-9]{4,32}$/.test(fileCode)) {
      return NextResponse.json({ error: 'Invalid file code' }, { status: 400 })
    }

    try {
      const res = await fetch(dataNodesUrl('/api/upload/url', { file_code: fileCode }), {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`DataNodes responded with ${res.status}`)
      return NextResponse.json(await res.json())
    } catch (err) {
      console.error('[uploads/upload/url poll] DataNodes error:', err)
      return NextResponse.json({ error: 'Failed to poll upload status' }, { status: 502 })
    }
  } else {
    return NextResponse.json({ error: 'Provide either url or file_code parameter' }, { status: 400 })
  }
}
