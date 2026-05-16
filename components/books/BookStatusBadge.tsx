import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { BookStatus } from '@/lib/types/app.types'
import { BOOK_STATUS_LABELS } from '@/lib/types/app.types'

const statusColors: Record<BookStatus, string> = {
  unread:   'bg-muted text-muted-foreground',
  reading:  'bg-primary/15 text-primary',
  finished: 'bg-green-100 text-green-700',
  review:   'bg-orange-100 text-orange-700',
}

export function BookStatusBadge({ status }: { status: BookStatus }) {
  return (
    <Badge
      variant="secondary"
      className={cn('text-xs font-medium shrink-0', statusColors[status])}
    >
      {BOOK_STATUS_LABELS[status]}
    </Badge>
  )
}
