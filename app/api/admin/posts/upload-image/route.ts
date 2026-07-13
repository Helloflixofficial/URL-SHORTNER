import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/rbac'
import { promises as fs } from 'fs'
import path from 'path'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  // 1. Security Check: Require admin session
  const session = await requireAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 2. Validate Size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 })
    }

    // 3. Validate Mime Type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed.' }, { status: 400 })
    }

    // 4. Validate Extension
    const originalName = file.name || 'image.png'
    const ext = path.extname(originalName).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: 'Invalid file extension' }, { status: 400 })
    }

    // 5. Generate Safe Unique Filename (prevents directory traversal and override)
    const uniqueId = crypto.randomUUID()
    const safeFilename = `${uniqueId}${ext}`

    // 6. Define Local Path inside workspace public directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'posts')
    
    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, safeFilename)

    // 7. Write File Buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    // 8. Return URL for public access
    const url = `/uploads/posts/${safeFilename}`
    return NextResponse.json({ success: true, url })
  } catch (err) {
    console.error('[Upload API Error]:', err)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
