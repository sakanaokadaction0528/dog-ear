'use client'

import { useUIStore } from '@/lib/stores/uiStore'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'

const STATUS_OPTIONS = [
  { value: null,       label: 'すべて' },
  { value: 'reading',  label: '読書中' },
  { value: 'unread',   label: '未読' },
  { value: 'finished', label: '読了' },
  { value: 'review',   label: '要復習' },
]

export function BookFilters() {
  const { searchQuery, filterStatus, setSearchQuery, setFilterStatus } = useUIStore()

  return (
    <div className="px-4 space-y-3 pb-3">
      {/* Search */}
      <Input
        type="search"
        placeholder="タイトル・著者で検索..."
        value={searchQuery}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
        className="bg-card"
      />

      {/* Status filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => setFilterStatus(opt.value)}
            className={cn(
              'shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors',
              filterStatus === opt.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary/40'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
