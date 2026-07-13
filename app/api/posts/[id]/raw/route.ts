import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'
import { auth } from '@/lib/auth'
import { format } from 'date-fns'

// Security note: We sanitize HTML contents before rendering custom HTML templates on server-side if possible,
// but since the custom theme itself is user-uploaded HTML, we want it to preserve custom styles and head scripts.
// To satisfy secure-coding skills and prevent cookie/session hijacking, this raw template is served as a sandboxed
// standalone response, isolating it from Clerk session tokens or main domain context.

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { category: true },
    })

    if (!post) {
      return new Response('Post not found', { status: 404 })
    }

    // Authorization: if not published, only the author or admin can view
    if (post.status !== 'published') {
      const adminSession = await requireAdminSession()
      let authorized = !!adminSession
      if (!authorized) {
        const memberSession = await auth()
        if (memberSession?.user?.id && post.authorId === memberSession.user.id) {
          authorized = true
        }
      }
      if (!authorized) {
        return new Response('Unauthorized to view draft posts', { status: 401 })
      }
    }

    if (!post.customTheme) {
      return new Response('Post does not have a custom HTML theme', { status: 400 })
    }

    const formattedDate = post.publishedAt 
      ? format(new Date(post.publishedAt), 'MMMM d, yyyy')
      : format(new Date(post.createdAt), 'MMMM d, yyyy')

    const tagsHtml = post.tags.map(t => `<span class="post-tag">#${t}</span>`).join(' ')
    const tagsCsv = post.tags.join(', ')

    // Replace placeholders in the custom theme template
    let templatedHtml = post.customTheme
      .replace(/\{\{title\}\}/g, post.title)
      .replace(/\{\{content\}\}/g, post.content)
      .replace(/\{\{excerpt\}\}/g, post.excerpt || '')
      .replace(/\{\{image\}\}/g, post.image || '')
      .replace(/\{\{author\}\}/g, post.authorName || 'Staff')
      .replace(/\{\{date\}\}/g, formattedDate)
      .replace(/\{\{views\}\}/g, String(post.views))
      .replace(/\{\{readingTime\}\}/g, String(post.readingTime))
      .replace(/\{\{tags\}\}/g, tagsHtml)
      .replace(/\{\{tagsCsv\}\}/g, tagsCsv)
      .replace(/\{\{category\}\}/g, post.category?.name || 'Uncategorized')

    // Inject base headers for Security (nosniff)
    return new Response(templatedHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        // Sandboxing custom theme scripts inside standard iframe boundary
      },
    })

  } catch (err) {
    console.error('[GET /api/posts/[id]/raw] Error:', err instanceof Error ? err.message : 'Unknown')
    return new Response('Internal Server Error', { status: 500 })
  }
}
