import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/rbac'
import { format } from 'date-fns'

export async function POST(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return new Response('Unauthorized', { status: 401 })
  }

  let theme = ''
  try {
    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('form')) {
      const formData = await req.formData()
      theme = String(formData.get('theme') || '')
    } else {
      const body = await req.json()
      theme = String(body.theme || '')
    }
  } catch {
    return new Response('Invalid request body', { status: 400 })
  }

  if (!theme) {
    return new Response('Theme content is empty', { status: 400 })
  }

  let post = await prisma.post.findFirst({
    where: { status: 'published' },
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })

  if (!post) {
    post = await prisma.post.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    })
  }

  const sampleTitle = post?.title || 'Sample Article Title'
  const sampleContent = post?.content || '<p>This is a sample paragraph of the post content body. It demonstrates how your theme renders rich text elements such as links, images, tables, lists, and headings.</p><img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800" alt="Sample Image" /><p>Another paragraph to provide sufficient content density to verify layout proportions.</p>'
  const sampleExcerpt = post?.excerpt || 'This is a sample excerpt of the article content to demonstrate meta info rendering.'
  const sampleImage = post?.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'
  const sampleAuthor = post?.authorName || 'John Doe'
  const sampleDate = post?.publishedAt 
    ? format(new Date(post.publishedAt), 'MMMM d, yyyy')
    : format(new Date(), 'MMMM d, yyyy')
  const sampleViews = post?.views || 1234
  const sampleReadingTime = post?.readingTime || 5
  const sampleTags = post?.tags.map(t => `<span class="post-tag">#${t}</span>`).join(' ') || '<span class="post-tag">#tutorial</span> <span class="post-tag">#linksite</span>'
  const sampleCategory = post?.category?.name || 'Uncategorized'
  const formattedTagsCsv = post?.tags.join(', ') || 'tutorial, linksite'

  let templatedHtml = theme
    .replace(/\{\{title\}\}/g, sampleTitle)
    .replace(/\{\{content\}\}/g, sampleContent)
    .replace(/\{\{excerpt\}\}/g, sampleExcerpt)
    .replace(/\{\{image\}\}/g, sampleImage)
    .replace(/\{\{author\}\}/g, sampleAuthor)
    .replace(/\{\{date\}\}/g, sampleDate)
    .replace(/\{\{views\}\}/g, String(sampleViews))
    .replace(/\{\{readingTime\}\}/g, String(sampleReadingTime))
    .replace(/\{\{tags\}\}/g, sampleTags)
    .replace(/\{\{tagsCsv\}\}/g, formattedTagsCsv)
    .replace(/\{\{category\}\}/g, sampleCategory)

  return new Response(templatedHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
