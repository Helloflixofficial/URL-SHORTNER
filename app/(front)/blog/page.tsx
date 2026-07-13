import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FileText, Calendar, Clock, Search, Tag, ChevronRight, ArrowRight, Rss, Mail, ShieldAlert, Flame } from 'lucide-react'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { NewsletterForm } from '@/components/posts/newsletter-form'


// Extract the first <img> src from HTML content for use as a thumbnail fallback
function extractFirstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return match ? match[1] : null
}

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Blog — Linksite Journal',
  description: 'Learn how to optimize your link earnings, increase traffic, and grow your digital presence with our official blog.',
}

interface PageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    tag?: string
    page?: string
  }>
}

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams
  const search = params.search || ''
  const categorySlug = params.category || ''
  const tagSlug = params.tag || ''
  const currentPage = Math.max(1, parseInt(params.page || '1'))
  const limit = 8

  // Find category ID if slug matches
  let categoryId: string | undefined
  let selectedCategoryName = ''
  if (categorySlug) {
    const cat = await prisma.postCategory.findUnique({
      where: { slug: categorySlug },
    })
    if (cat) {
      categoryId = cat.id
      selectedCategoryName = cat.name
    }
  }

  // Construct query where clause
  const where: Record<string, any> = {
    status: 'published',
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (categoryId) {
    where.categoryId = categoryId
  }

  if (tagSlug) {
    where.tags = { has: tagSlug }
  }

  const [posts, total, categories, trendingPosts] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (currentPage - 1) * limit,
      take: limit,
      include: { category: true },
    }),
    prisma.post.count({ where }),
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
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="bg-[#f9f9f9] text-[#212121] min-h-screen font-sans antialiased">
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
                className={`text-xs font-bold uppercase tracking-wider py-4 px-3 border-b-2 inline-block transition-all duration-200 ${
                  !categorySlug && !tagSlug
                    ? 'border-[#EEFF41] text-white'
                    : 'border-transparent text-[#bcbcbc] hover:border-[#EEFF41] hover:text-white'
                }`}
              >
                All Posts
              </Link>
            </li>
            {categories.slice(0, 4).map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/blog?category=${cat.slug}`}
                  className={`text-xs font-bold uppercase tracking-wider py-4 px-3 border-b-2 inline-block transition-all duration-200 ${
                    categorySlug === cat.slug
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
              {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
              {tagSlug && <input type="hidden" name="tag" value={tagSlug} />}
              <input
                type="text"
                name="search"
                defaultValue={search}
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
        
        {/* Active Filters */}
        {(selectedCategoryName || tagSlug || search) && (
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6 p-3 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] border border-[#E6E6E6] rounded-[3px]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#757575] uppercase">Active Filter:</span>
              {selectedCategoryName && (
                <span className="text-xs font-bold px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-100 rounded-[3px]">
                  Category: {selectedCategoryName}
                </span>
              )}
              {tagSlug && (
                <span className="text-xs font-bold px-2 py-0.5 bg-[#f6f5f2] text-[#1a1a19] border border-[#dedcd6] rounded-[3px]">
                  Tag: #{tagSlug}
                </span>
              )}
              {search && (
                <span className="text-xs font-bold px-2 py-0.5 bg-yellow-50 text-yellow-800 border border-yellow-100 rounded-[3px]">
                  Search: &ldquo;{search}&rdquo;
                </span>
              )}
            </div>
            <Link
              href="/blog"
              className="text-xs text-[#F44336] hover:text-[#D32F2F] hover:underline font-bold"
            >
              Clear filters
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
          
          {/* ─── LEFT: ARTICLES FEED ─── */}
          <div id="post-wrapper" className="w-full">
            {posts.length === 0 ? (
              <div className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] rounded-[3px] p-8 text-center">
                <FileText className="w-10 h-10 text-[#bcbcbc] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#212121]">No articles found</h3>
                <p className="text-[#757575] text-xs mt-1 max-w-xs mx-auto">
                  We couldn&apos;t find any posts matching your criteria. Try adjusting your search query.
                </p>
                <Button asChild className="mt-4 bg-[#263238] hover:bg-slate-800 text-white rounded-[3px] text-xs h-8 px-4 font-bold">
                  <Link href="/blog">Reset search</Link>
                </Button>
              </div>
            ) : (
              <div className="post-container">
                {posts.map((post) => {
                  const thumbnail = post.image || extractFirstImage(post.content)
                  return (
                  <article
                    key={post.id}
                    className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] p-[15px] mb-5 rounded-[3px]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Text Content */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-[#212121] text-base md:text-lg font-bold hover:text-[#F44336] leading-snug transition-colors mb-2">
                          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                        </h2>

                        {post.excerpt && (
                          <p className="text-[#757575] text-xs md:text-sm leading-relaxed font-serif line-clamp-3 mb-3">
                            {post.excerpt}
                          </p>
                        )}
                      </div>

                      {/* Right: Clickable Image/Placeholder block */}
                      <Link href={`/blog/${post.slug}`} className="shrink-0 block">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt=""
                            className="w-[70px] h-[70px] object-cover rounded-[3px] hover:opacity-90 transition-opacity border border-slate-100"
                          />
                        ) : (
                          <div className="w-[70px] h-[70px] bg-[#EEFF41]/20 border border-[#EEFF41]/40 rounded-[3px] flex items-center justify-center text-[#827717] hover:bg-[#EEFF41]/30 transition-colors">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                      </Link>
                    </div>

                    <div className="flex flex-wrap items-center justify-between pt-3 mt-3 border-t border-[#E6E6E6] text-[10px] md:text-xs">
                      <span className="text-[#9e9e9e] font-semibold">
                        By {post.authorName || 'Staff'} · {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : format(new Date(post.createdAt), 'MMM d, yyyy')}
                      </span>
                      {post.category && (
                        <Link
                          href={`/blog?category=${post.category.slug}`}
                          className="bg-[#eee] hover:bg-[#ddd] rounded-[3px] text-[#9e9e9e] text-[10px] py-0.5 px-2 uppercase font-bold tracking-wider transition-colors"
                        >
                          {post.category.name}
                        </Link>
                      )}
                    </div>
                  </article>
                  )
                })}


                {/* ─ Pagination ─ */}
                {totalPages > 1 && (
                  <div id="blog-pager" className="flex items-center justify-center gap-2 pt-6">
                    {Array.from({ length: totalPages }, (_, i) => {
                      const p = i + 1
                      const query: Record<string, string> = { page: String(p) }
                      if (search) query.search = search
                      if (categorySlug) query.category = categorySlug
                      if (tagSlug) query.tag = tagSlug
                      const qs = new URLSearchParams(query).toString()

                      return (
                        <Link
                          key={p}
                          href={`/blog?${qs}`}
                          className={`px-3 py-1.5 text-xs font-bold uppercase rounded-[2px] transition-all duration-150 ${
                            p === currentPage
                              ? 'bg-[#EEFF41] text-[#827717] shadow-[0_1px_3px_rgba(0,0,0,0.12)] border border-[#827717]/20'
                              : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {p}
                        </Link>
                      )
                    })}
                  </div>
                )}
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
                Join our newsletter and receive optimization tips, monetization updates, and strategy guides.
              </p>
              <NewsletterForm />
            </div>

            {/* Disclaimer / Info Widget */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-[3px]">
              <div className="flex gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-slate-800 uppercase">Earning Disclosure</h5>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Some articles contain referral links. Reading or registering through our link adds earnings to our platform which supports our publishing schedule.
                  </p>
                </div>
              </div>
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
  )
}
