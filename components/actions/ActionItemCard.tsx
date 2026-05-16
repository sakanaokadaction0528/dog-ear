'use client'

import { Check, X, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ACTION_CATEGORY_LABELS, PRIORITY_LABELS } from '@/lib/types/app.types'
import type { ActionItem } from '@/lib/types/app.types'

const priorityColors = {
  high:   'text-red-600 bg-red-50',
  medium: 'text-amber-600 bg-amber-50',
  low:    'text-muted-foreground bg-muted',
}

interface ActionItemCardProps {
  item: ActionItem
  onToggle: (id: string, completed: boolean) => void
  onDelete?: (id: string) => void
}

export function ActionItemCard({ item, onToggle, onDelete }: ActionItemCardProps) {
  return (
    <div
      className={cn(
        'flex gap-3 bg-card border border-border rounded-xl p-4 transition-opacity',
        item.completed && 'opacity-50'
      )}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(item.id, !item.completed)}
        className={cn(
          'mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors',
          item.completed
            ? 'bg-primary border-primary text-primary-foreground'
            : 'border-border hover:border-primary'
        )}
      >
        {item.completed && <Check size={10} strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium text-foreground', item.completed && 'line-through')}>
          {item.title}
        </p>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
            {ACTION_CATEGORY_LABELS[item.category as keyof typeof ACTION_CATEGORY_LABELS]}
          </span>
          <span className={cn('text-xs rounded-full px-2 py-0.5', priorityColors[item.priority as keyof typeof priorityColors])}>
            {PRIORITY_LABELS[item.priority as keyof typeof PRIORITY_LABELS]}
          </span>
          {item.due_date && (
            <span className="text-xs bg-secondary text-muted-foreground rounded-full px-2 py-0.5 flex items-center gap-1">
              <Calendar size={10} />
              {item.due_date}
            </span>
          )}
        </div>
      </div>

      {onDelete && (
        <button
          onClick={() => onDelete(item.id)}
          className="text-muted-foreground hover:text-destructive shrink-0 transition-colors p-0.5"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
