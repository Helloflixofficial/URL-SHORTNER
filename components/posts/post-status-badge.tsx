'use client'
import { cn } from '@/lib/utils'

export type PostStatus = 'draft' | 'published' | 'scheduled' | 'trashed'

const statusConfig: Record<PostStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'text-muted-foreground bg-muted/60 border border-border/50',
  },
  published: {
    label: 'Published',
    className: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20',
  },
  scheduled: {
    label: 'Scheduled',
    className: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
  },
  trashed: {
    label: 'Trashed',
    className: 'text-red-400 bg-red-400/10 border border-red-400/20',
  },
}

export function PostStatusBadge({
  status,
  className,
}: {
  status: PostStatus
  className?: string
}) {
  const config = statusConfig[status] ?? statusConfig.draft
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
        config.className,
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full mr-1.5',
          status === 'published' && 'bg-emerald-400',
          status === 'scheduled' && 'bg-blue-400',
          status === 'trashed' && 'bg-red-400',
          status === 'draft' && 'bg-muted-foreground',
        )}
      />
      {config.label}
    </span>
  )
}
