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

// GET /api/uploads/check?file_code=code1,code2,...
// No API key required by DataNodes for this endpoint — but we still gate it
export async function GET(req: NextRequest) {
  const session = await requireAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const fileCodesRaw = req.nextUrl.searchParams.get('file_code') ?? ''
  if (!fileCodesRaw) {
    return NextResponse.json({ error: 'file_code parameter required' }, { status: 400 })
  }

  // Validate each code: alphanumeric, max 100 codes
  const codes = fileCodesRaw.split(',').map((c) => c.trim())
  if (codes.length > 100) {
    return NextResponse.json({ error: 'Maximum 100 file codes allowed' }, { status: 400 })
  }
  for (const code of codes) {
    if (!/^[a-zA-Z0-9]{4,32}$/.test(code)) {
      return NextResponse.json({ error: `Invalid file code: ${code}` }, { status: 400 })
    }
  }

  try {
    const url = new URL(`${DATANODES_BASE}/api/files/check`)
    url.searchParams.set('file_code', codes.join(','))
    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) throw new Error(`DataNodes responded with ${res.status}`)
    return NextResponse.json(await res.json())
  } catch (err) {
    console.error('[uploads/check GET] DataNodes error:', err)
    return NextResponse.json({ error: 'Failed to check file status' }, { status: 502 })
  }
}
