import { PostCardSkeleton } from '@/components/shared/Skeleton'

export default function ProfileLoading() {
  return (
    <div className="px-4 pt-6 pb-24 space-y-6">
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
        <div className="h-4 w-28 rounded bg-muted animate-pulse" />
        <div className="h-3 w-40 rounded bg-muted animate-pulse" />
      </div>
      <div className="space-y-4">
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    </div>
  )
}
