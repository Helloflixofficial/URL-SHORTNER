import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PostForm from '@/components/admin/post-form'

export const metadata = { title: 'Create New Post — Admin' }

export default function NewPostPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black font-display">
          Create <span className="gradient-text">Post</span>
        </h1>
        <p className="text-muted-foreground mt-1">Share news and updates with your audience</p>
      </div>

      <Card className="glass border-border/50">
        <CardContent className="pt-6">
          <PostForm />
        </CardContent>
      </Card>
    </div>
  )
}
