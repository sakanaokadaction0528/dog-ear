import { BookCardSkeleton } from '@/components/shared/Skeleton'

export default function ActionsLoading() {
  return (
    <div>
      <div className="px-4 pt-5 pb-4 border-b border-border">
        <div className="h-6 w-24 rounded bg-muted animate-pulse" />
      </div>
      <div className="px-4 pt-4 space-y-2 pb-6">
        {[0, 1, 2, 3].map(i => <BookCardSkeleton key={i} />)}
      </div>
    </div>
  )
}
