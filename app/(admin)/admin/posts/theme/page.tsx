import { requireAdminSession } from '@/lib/rbac'
import { redirect } from 'next/navigation'
import { getOption } from '@/lib/options'
import BlogThemeForm from '@/components/admin/blog-theme-form'

export const metadata = { title: 'Admin — Blog Theme' }

export default async function AdminBlogThemePage() {
  const session = await requireAdminSession()
  if (!session) redirect('/login')

  const themeCode = await getOption('blog_custom_theme', '')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-display">
          Blog <span className="gradient-text">Theme</span>
        </h1>
        <p className="text-muted-foreground mt-1">Configure your custom Blogger HTML/XML template</p>
      </div>
      <BlogThemeForm initialTheme={themeCode} />
    </div>
  )
}
