import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const DATANODES_BASE = process.env.DATANODES_API_BASE ?? 'https://datanodes.to'
const DATANODES_KEY = process.env.DATANODES_API_KEY

// Helper: forward a GET request to DataNodes and return JSON
async function dataNodesGet(path: string, params: Record<string, string> = {}) {
  if (!DATANODES_KEY) {
    throw new Error('DATANODES_API_KEY is not configured')
  }
  const url = new URL(`${DATANODES_BASE}${path}`)
  url.searchParams.set('key', DATANODES_KEY)
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') url.searchParams.set(k, v)
  }
  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`DataNodes responded with ${res.status}`)
  }
  return res.json()
}

// GET /api/uploads/account — returns account info + stats
export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const role = (session.user as { role?: string }).role
  if (role !== 'admin' && role !== 'owner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const [info, stats] = await Promise.all([
      dataNodesGet('/api/account/info'),
      dataNodesGet('/api/account/stats'),
    ])
    return NextResponse.json({ info, stats })
  } catch (err) {
    // Do not expose internal error details to client
    console.error('[uploads/account] DataNodes error:', err)
    return NextResponse.json({ error: 'Failed to fetch account data' }, { status: 502 })
  }
}
