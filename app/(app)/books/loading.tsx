import { BookCardSkeleton } from '@/components/shared/Skeleton'

export default function BooksLoading() {
  return (
    <div>
      <div className="px-4 pt-5 pb-4 border-b border-border">
        <div className="h-6 w-16 rounded bg-muted animate-pulse" />
      </div>
      <div className="px-4 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pb-6">
        {[0, 1, 2, 3].map(i => <BookCardSkeleton key={i} />)}
      </div>
    </div>
  )
}
