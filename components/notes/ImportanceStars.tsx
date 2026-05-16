'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ImportanceStarsProps {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
}

export function ImportanceStars({ value, onChange, readonly = false }: ImportanceStarsProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          className={cn(
            'transition-transform leading-none',
            !readonly && 'hover:scale-110 active:scale-95',
            readonly && 'cursor-default'
          )}
        >
          <Star
            size={18}
            strokeWidth={1.5}
            className={cn(
              'transition-colors',
              n <= value
                ? 'fill-amber-400 text-amber-400'
                : 'fill-transparent text-muted-foreground/30'
            )}
          />
        </button>
      ))}
    </div>
  )
}
