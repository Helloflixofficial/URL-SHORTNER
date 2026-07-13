import { Card, CardContent } from '@/components/ui/card'

export default function UploadsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted/40" />
        <div className="space-y-1.5">
          <div className="h-7 w-32 bg-muted/40 rounded" />
          <div className="h-4 w-56 bg-muted/30 rounded" />
        </div>
      </div>

      {/* Account widget skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="glass border-border/50">
            <CardContent className="pt-5 pb-4">
              <div className="w-9 h-9 rounded-xl bg-muted/40 mb-3" />
              <div className="h-6 w-16 bg-muted/40 rounded mb-1" />
              <div className="h-3 w-12 bg-muted/30 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* File manager skeleton */}
      <Card className="glass border-border/50">
        <CardContent className="p-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-border/20">
              <div className="h-4 w-48 bg-muted/40 rounded" />
              <div className="h-4 w-16 bg-muted/30 rounded ml-auto" />
              <div className="h-4 w-12 bg-muted/30 rounded" />
              <div className="w-8 h-8 rounded-lg bg-muted/30" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
