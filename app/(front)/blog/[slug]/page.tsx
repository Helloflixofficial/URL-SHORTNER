import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  ArrowLeft, Eye, Tag, Flame, Search,
  FileText, Mail, Bookmark, ThumbsUp
} from 'lucide-react'
import SafeHtml from '@/components/posts/safe-html'
import ShareButtons from '@/components/posts/share-buttons'
import ReadingProgressBar from '@/components/posts/reading-progress'
import { Metadata } from 'next'
import { NewsletterForm } from '@/components/posts/newsletter-form'
import { requireAdminSession } from '@/lib/rbac'
import BlogAdBar from '@/components/posts/blog-ad-bar'


// Extract the first <img> src from HTML content for use as thumbnail fallback
function extractFirstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return match ? match[1] : null
}

interface PostPageProps {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{
    preview?: string
    alias?: string
    step?: string
    data?: string
  }>
}


export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug, status: 'published' },
    select: { title: true, excerpt: true, metaTitle: true, metaDesc: true, image: true },
  })
  if (!post) return { title: 'Post Not Found' }
  return {
    title: `${post.metaTitle || post.title} — Linksite Journal`,
    description: post.metaDesc || post.excerpt || undefined,
    openGraph: {
      images: post.image ? [post.image] : [],
    },
  }
}

export default async function BlogPostPage({ params, searchParams }: PostPageProps) {
  const { slug } = await params
  const sp = searchParams ? await searchParams : {}
  const isPreview = sp.preview === '1'
  const alias = sp.alias || ''
  const currentStep = parseInt(sp.step || '0')
  const adDataEncoded = sp.data || ''
  const isAdVisit = !!alias && currentStep > 0
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // In preview mode, allow admins to view any status post
  const whereClause = isPreview
    ? { slug }
    : { slug, status: 'published' as const }

  if (isPreview) {
    // Only admins can use preview mode
    const adminSession = await requireAdminSession().catch(() => null)
    if (!adminSession) return notFound()
  }

  const post = await prisma.post.findUnique({
    where: whereClause,
    include: { category: { select: { id: true, name: true, slug: true } } },
  })

  if (!post) notFound()

  // Only increment views for real (non-preview) visits
  if (!isPreview) {
    try {
      await prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } })
    } catch {}
  }

  const [categories, trendingPosts, adsTimerOpt, adsStepsOpt] = await Promise.all([
    prisma.postCategory.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.post.findMany({
      where: { status: 'published' },
      orderBy: { views: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        views: true,
        image: true,
        readingTime: true,
        category: {
          select: { name: true, slug: true }
        }
      },
    }),
    prisma.option.findUnique({ where: { key: 'ads_blog_interstitial_timer' } }),
    prisma.option.findUnique({ where: { key: 'ads_blog_interstitial_steps' } }),
  ])

  const adsTimer = parseInt(adsTimerOpt?.value || '25')
  const adsSteps = parseInt(adsStepsOpt?.value || '1')

  let nextPostSlug = ''
  if (isAdVisit && currentStep < adsSteps) {
    const count = await prisma.post.count({
      where: { status: 'published', id: { not: post.id } }
    })
    if (count > 0) {
      const skip = Math.floor(Math.random() * count)
      const nextPost = await prisma.post.findFirst({
        where: { status: 'published', id: { not: post.id } },
        skip: skip,
        select: { slug: true },
      })
      if (nextPost) nextPostSlug = nextPost.slug
    } else {
      nextPostSlug = post.slug
    }
  }



  // Related posts (same category or recent)
  const relatedPosts = await prisma.post.findMany({
    where: {
      id: { not: post.id },
      status: 'published',
      ...(post.categoryId ? { categoryId: post.categoryId } : {}),
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: {
      id: true, title: true, slug: true, image: true,
      publishedAt: true, readingTime: true, excerpt: true,
      category: { select: { name: true, slug: true } },
    },
  })

  // More posts fallback if not enough related
  const morePosts = relatedPosts.length < 3
    ? await prisma.post.findMany({
        where: { id: { not: post.id }, status: 'published' },
        orderBy: { views: 'desc' },
        take: 3 - relatedPosts.length,
        select: {
          id: true, title: true, slug: true, image: true,
          publishedAt: true, readingTime: true, excerpt: true,
          category: { select: { name: true, slug: true } },
        },
      })
    : []

  const allRelated = [...relatedPosts, ...morePosts]
  const postUrl = `${siteUrl}/blog/${post.slug}`
  const publishDate = post.publishedAt ?? post.createdAt
  const featuredImage = post.image


  return (
    <>
      <ReadingProgressBar />

      {/* Draft Preview Banner */}
      {isPreview && post.status !== 'published' && (
        <div className="fixed top-0 left-0 right-0 z-[70] bg-amber-500 text-amber-950 text-xs font-bold text-center py-1.5 flex items-center justify-center gap-2">
          <span>⚠ PREVIEW MODE — This post is a draft and not visible to the public</span>
          <a href={`/admin/posts/${post.id}/edit`} className="underline hover:text-amber-800">← Back to Editor</a>
        </div>
      )}



      <div className={`bg-[#f9f9f9] text-[#212121] min-h-screen font-sans antialiased ${isAdVisit ? 'pt-[60px]' : ''}`}>
        {/* Inject Speech-Bubble Blockquote Styles */}

        <style dangerouslySetInnerHTML={{ __html: `
          .blog-prose blockquote {
            position: relative !important;
            color: #333 !important;
            border: 5px solid #0ABCB1 !important;
            border-radius: 30px !important;
            padding: 20px 30px !important;
            margin: 1.5em 20px !important;
            text-align: center !important;
            font-family: Georgia, serif !important;
            font-weight: 600 !important;
            background: #fff !important;
            box-shadow: none !important;
          }
          .blog-prose blockquote::before, .blog-prose blockquote::after {
            content: none !important;
          }
          @media (min-width: 768px) {
            .blog-prose blockquote {
              border-radius: 100px !important;
              padding: 30px 60px !important;
              margin: 2em 60px 60px !important;
            }
            .blog-prose blockquote::before {
              display: block !important;
              border: 10px solid #21B028 !important;
              position: absolute !important;
              background: #fff !important;
              content: "" !important;
              height: 50px !important;
              width: 50px !important;
              right: 100px !important;
              bottom: -40px !important;
              border-radius: 50px !important;
              z-index: 10 !important;
            }
            .blog-prose blockquote::after {
              position: absolute !important;
              background: #fff !important;
              display: block !important;
              content: "" !important;
              height: 25px !important;
              border: 10px solid #5A8F00 !important;
              bottom: -60px !important;
              right: 50px !important;
              width: 25px !important;
              border-radius: 25px !important;
              z-index: 10 !important;
            }
          }
        `}} />

        {/* ─── BLOG HEADER ─── */}
        <header id="header-wrapper" className="bg-[#263238]">
          <div className="max-w-[1140px] mx-auto px-4 py-8 text-center md:text-left">
            <Link href="/blog" className="text-white text-3xl md:text-4xl font-normal hover:text-[#FAFAFA] transition-colors font-display">
              Linksite Journal
            </Link>
            <p className="text-slate-400 text-xs mt-2 font-serif">
              Strategies, tutorials, and insights to maximize your link earnings.
            </p>
          </div>
        </header>

        {/* ─── NAVIGATION & SEARCH ─── */}
        <div id="nav-wrapper" className="bg-[#263238] shadow-[0_2px_3px_rgba(0,0,0,0.12),0_2px_2px_rgba(0,0,0,0.24)] border-t border-slate-700/60 sticky top-0 z-30">
          <nav className="max-w-[1140px] mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
            {/* Menu links */}
            <ul className="flex flex-wrap items-center gap-1">
              <li>
                <Link
                  href="/blog"
                  className="text-xs font-bold uppercase tracking-wider py-4 px-3 border-b-2 inline-block transition-all duration-200 border-transparent text-[#bcbcbc] hover:border-[#EEFF41] hover:text-white"
                >
                  All Posts
                </Link>
              </li>
              {categories.slice(0, 4).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/blog?category=${cat.slug}`}
                    className={`text-xs font-bold uppercase tracking-wider py-4 px-3 border-b-2 inline-block transition-all duration-200 ${
                      post.category?.slug === cat.slug
                        ? 'border-[#EEFF41] text-white'
                        : 'border-transparent text-[#bcbcbc] hover:border-[#EEFF41] hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Search box */}
            <div id="search-form" className="py-2 md:py-0 w-full md:w-auto">
              <form action="/blog" method="GET" className="relative flex items-center">
                <input
                  type="text"
                  name="search"
                  placeholder="Search articles..."
                  className="w-full md:w-[200px] bg-[#374851] text-[#ECEFF1] rounded-[3px] border-none px-3 py-1.5 text-xs placeholder-[#ECEFF1]/50 focus:bg-white focus:text-[#212121] outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 text-[#ECEFF1]/60 hover:text-white pointer-events-none"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </nav>
        </div>

        {/* ─── MAIN WRAPPER ─── */}
        <div id="wrapper" className="max-w-[1140px] mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
            
            {/* ─── LEFT: MAIN CONTENT ─── */}
            <div id="post-wrapper" className="w-full">
              {/* Back link */}
              <Link href="/blog" className="text-xs text-[#757575] font-bold hover:text-[#F44336] uppercase mb-4 inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to blog
              </Link>

              {/* Post Container Card */}
              <div className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] p-[20px] md:p-[30px] rounded-[3px] mb-5">
                
                {/* Breadcrumbs */}
                <div className="breadcrumbs text-[#9E9E9E] text-[10px] font-bold uppercase border-b border-[#E6E6E6] pb-3 mb-5">
                  <Link href="/blog">Home</Link>
                  {post.category && (
                    <>
                      <span className="mx-2">&gt;</span>
                      <Link href={`/blog?category=${post.category.slug}`}>{post.category.name}</Link>
                    </>
                  )}
                  <span className="mx-2">&gt;</span>
                  <span className="text-slate-500">{post.title}</span>
                </div>

                <h1 className="text-[#212121] text-2xl md:text-3xl font-bold leading-snug mb-4">
                  {post.title}
                </h1>

                {/* Meta details */}
                <div className="text-xs text-[#9E9E9E] mb-6 flex flex-wrap items-center gap-2">
                  <span>By {post.authorName || 'Staff'}</span>
                  <span>·</span>
                  <span>{format(new Date(publishDate), 'MMMM d, yyyy')}</span>
                  <span>·</span>
                  <span>{post.readingTime} min read</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{post.views.toLocaleString()} views</span>
                </div>

                {/* Featured Image — uses dedicated image or first image from content */}
                {featuredImage && (
                  <div className="w-full mb-6 max-h-[420px] overflow-hidden rounded-[3px] border border-slate-200">
                    <img src={featuredImage} alt={post.title} className="w-full h-auto object-cover" />
                  </div>
                )}

                {/* Prose Body */}
                <div className="prose prose-slate max-w-none blog-prose text-[#212121]
                  prose-headings:text-[#212121] prose-headings:font-bold prose-headings:font-sans
                  prose-h2:text-2xl prose-h2:border-b prose-h2:border-[#E6E6E6] prose-h2:pb-2
                  prose-h3:text-xl
                  prose-p:text-[#212121] prose-p:text-[15px] prose-p:md:text-[16px] prose-p:leading-relaxed prose-p:mb-4
                  prose-a:text-[#F44336] prose-a:underline hover:prose-a:text-[#D32F2F]
                  prose-strong:text-[#212121]
                  prose-code:text-[#727272] prose-code:bg-[#e8eaf6] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-[#424242] prose-pre:text-[#fafafa] prose-pre:rounded-[3px] prose-pre:p-4
                  prose-img:rounded-[3px] prose-img:border prose-img:border-slate-200
                  prose-table:border-collapse
                  prose-th:bg-[#f5f5f5] prose-th:px-4 prose-th:py-2.5 prose-th:border prose-th:border-slate-200 prose-th:text-[#212121]
                  prose-td:px-4 prose-td:py-2.5 prose-td:border prose-td:border-slate-200
                ">
                  <SafeHtml html={post.content} />
                </div>

                {/* Blog Redirection Ad Bar & Button (renders top-bar fixed, and bottom-button here) */}
                {isAdVisit && (
                  <BlogAdBar
                    timer={adsTimer}
                    currentStep={currentStep}
                    totalSteps={adsSteps}
                    alias={alias}
                    adDataEncoded={adDataEncoded}
                    nextPostSlug={nextPostSlug}
                  />
                )}


                {/* Share buttons */}
                <div className="mt-8 pt-4 border-t border-[#E6E6E6] flex items-center justify-between gap-4">
                  <ShareButtons title={post.title} url={postUrl} />
                  <div className="flex gap-2">
                    <button className="p-1.5 rounded-[3px] border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors">
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-[3px] border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Recommended Readings */}
              {allRelated.length > 0 && (
                <div className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] p-[20px] md:p-[30px] rounded-[3px] mb-5">
                  <h3 className="text-lg font-bold text-[#212121] mb-4">Recommended Readings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {allRelated.map((rp) => (
                      <Link
                        key={rp.id}
                        href={`/blog/${rp.slug}`}
                        className="group bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-[3px] overflow-hidden flex flex-col justify-between"
                      >
                        {rp.image && (
                          <div className="aspect-[16/10] w-full overflow-hidden">
                            <img
                              src={rp.image}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <h4 className="font-bold text-xs leading-snug line-clamp-2 text-[#212121] group-hover:text-[#F44336] transition-colors">
                            {rp.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 mt-2 block">
                            {rp.readingTime} min read
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ─── RIGHT: SIDEBAR ─── */}
            <aside id="sidebar-wrapper" className="w-full flex flex-col gap-5">
              {/* Popular Posts Widget */}
              {trendingPosts.length > 0 && (
                <div className="bg-white rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] p-[15px] PopularPosts">
                  <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#E6E6E6] text-[#F44336] font-bold text-sm uppercase tracking-wider font-display">
                    <Flame className="w-4 h-4" />
                    <h2>Popular Posts</h2>
                  </div>
                  <div className="space-y-2">
                    {trendingPosts.map((post, idx) => {
                      const bgColors = [
                        'bg-[#F48067] hover:bg-[#0FB9BB]',
                        'bg-[#2ba6e1] hover:bg-[#0FB9BB]',
                        'bg-[#718397] hover:bg-[#0FB9BB]',
                        'bg-[#11b7b5] hover:bg-[#0FB9BB]',
                        'bg-[#d9ba71] hover:bg-[#0FB9BB]',
                      ]
                      const bgColor = bgColors[idx] || 'bg-[#d9ba71] hover:bg-[#0FB9BB]'
                      
                      return (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          className={`flex items-center gap-3 p-2.5 text-white rounded-[3px] font-bold text-xs uppercase transition-colors duration-150 ${bgColor}`}
                        >
                          <div className="w-6 h-6 border border-white rounded-full flex items-center justify-center shrink-0 text-xs font-mono">
                            {idx + 1}
                          </div>
                          <span className="truncate flex-1">{post.title}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Categories / Labels Widget */}
              {categories.length > 0 && (
                <div className="bg-white rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] p-[15px]">
                  <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#E6E6E6] text-[#00BCD4] font-bold text-sm uppercase tracking-wider font-display">
                    <Tag className="w-4 h-4" />
                    <h2>Labels</h2>
                  </div>
                  <div className="flex flex-wrap gap-y-2">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/blog?category=${cat.slug}`}
                        className="bg-[#EEFF41] hover:bg-[#827717] hover:text-[#EEFF41] text-[#827717] rounded-[3px] text-xs font-bold px-2.5 py-1 transition-colors duration-150 mr-2 mt-1 inline-block"
                      >
                        {cat.name} ({cat.postCount})
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter Widget */}
              <div className="bg-white rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] p-[15px]">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#E6E6E6] text-[#4CAF50] font-bold text-sm uppercase tracking-wider font-display">
                  <Mail className="w-4 h-4" />
                  <h2>Follow Us</h2>
                </div>
                <p className="text-xs text-[#757575] mb-4 font-serif leading-relaxed">
                  Subscribe to receive our latest link optimization strategies directly to your inbox.
                </p>
                <NewsletterForm />
              </div>
            </aside>

          </div>
        </div>

        {/* ─── FOOTER ─── */}
        <footer id="footer-wrapper" className="bg-[#1e272c] border-t-4 border-[#EEFF41] text-[#bcbcbc] text-xs mt-12 py-10">
          <div className="max-w-[858px] mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-700/60">
              {/* Col 1: About */}
              <div className="space-y-3">
                <h4 className="text-white font-bold text-sm uppercase tracking-wider font-display">About the Journal</h4>
                <p className="text-slate-400 text-xs font-serif leading-relaxed">
                  Linksite Journal is a dedicated publishing channel sharing digital monetization strategies, optimization tutorials, and expert traffic growth insights.
                </p>
              </div>
              {/* Col 2: Quick Links */}
              <div className="space-y-3">
                <h4 className="text-white font-bold text-sm uppercase tracking-wider font-display">Popular Categories</h4>
                <ul className="space-y-2 text-slate-400 text-xs">
                  {categories.slice(0, 3).map((cat) => (
                    <li key={cat.id}>
                      <Link href={`/blog?category=${cat.slug}`} className="hover:text-[#EEFF41] transition-colors">
                        &raquo; {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Col 3: Follow */}
              <div className="space-y-3">
                <h4 className="text-white font-bold text-sm uppercase tracking-wider font-display">Keep in Touch</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Stay updated with the latest monetization tips and platform features.
                </p>
                <div className="flex gap-3 text-slate-400 text-xs mt-2">
                  <Link href="/blog" className="hover:text-[#EEFF41] transition-colors uppercase font-bold tracking-wider">Blog Feed</Link>
                  <span>·</span>
                  <Link href="/" className="hover:text-[#EEFF41] transition-colors uppercase font-bold tracking-wider">Home Page</Link>
                </div>
              </div>
            </div>
            
            <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-[10px]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider font-display">Linksite Journal</span>
                <span>&copy; {new Date().getFullYear()}</span>
              </div>
              <p>
                Powered by Next.js &middot; Retro Magazine Theme
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )

}
