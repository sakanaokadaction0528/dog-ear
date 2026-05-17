import { PostCardSkeleton } from '@/components/shared/Skeleton'

export default function FeedLoading() {
  return (
    <div>
      <div className="px-4 pt-5 pb-4 border-b border-border">
        <div className="h-6 w-20 rounded bg-muted animate-pulse" />
      </div>
      <div className="px-4 pt-4 pb-24 space-y-4">
        {[0, 1, 2].map(i => <PostCardSkeleton key={i} />)}
      </div>
    </div>
  )
}
