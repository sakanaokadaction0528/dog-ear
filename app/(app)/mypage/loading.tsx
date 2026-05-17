import { StatsSkeleton } from '@/components/shared/Skeleton'

export default function MyPageLoading() {
  return (
    <div className="px-4 pt-6 pb-8 space-y-6">
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
      </div>
      <StatsSkeleton />
    </div>
  )
}
