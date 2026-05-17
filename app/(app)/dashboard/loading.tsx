import { BookCardSkeleton, StatsSkeleton } from '@/components/shared/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="px-4 pt-5 pb-6 space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-muted animate-pulse" />
        <div className="space-y-1.5">
          <div className="h-5 w-20 rounded bg-muted animate-pulse" />
          <div className="h-3 w-32 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <StatsSkeleton />
      <div className="space-y-2">
        <BookCardSkeleton />
        <BookCardSkeleton />
      </div>
    </div>
  )
}
