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

/**
 * GET /api/uploads/upload
 * Returns a DataNodes upload server URL + session ID.
 * The client then POSTs the file DIRECTLY to DataNodes (no file data passes through this server).
 * This eliminates all Next.js body-size restrictions and is the correct DataNodes flow.
 */
export async function GET() {
  const session = await requireAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!DATANODES_KEY) {
    return NextResponse.json({ error: 'DataNodes API key not configured' }, { status: 500 })
  }

  try {
    const url = new URL(`${DATANODES_BASE}/api/upload/server`)
    url.searchParams.set('key', DATANODES_KEY)
    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) throw new Error(`DataNodes responded with ${res.status}`)
    const data = await res.json()
    // Return upload_url and sess_id to the client so it can upload directly
    return NextResponse.json({
      upload_url: data.result,
      sess_id: data.sess_id,
      status: data.status,
    })
  } catch (err) {
    console.error('[uploads/upload GET] DataNodes error:', err)
    return NextResponse.json({ error: 'Failed to get upload server' }, { status: 502 })
  }
}
