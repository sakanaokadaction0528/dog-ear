'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useActionItems } from '@/lib/hooks/useActionItems'
import { ActionItemCard } from '@/components/actions/ActionItemCard'
import { ActionItemForm } from '@/components/actions/ActionItemForm'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ACTION_CATEGORY_LABELS } from '@/lib/types/app.types'
import type { ActionCategory, ActionItem } from '@/lib/types/app.types'
import type { ActionFormValues } from '@/lib/validators/action'

const CATEGORY_ORDER: ActionCategory[] = [
  'today', 'this_week', 'long_term', 'work', 'side_hustle', 'publish',
]

export default function ActionsPage() {
  const { items, loading, createItem, toggleComplete, deleteItem } = useActionItems()
  const [showForm, setShowForm] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)

  const active = items.filter((i: ActionItem) => !i.completed)
  const completed = items.filter((i: ActionItem) => i.completed)

  // Group active items by category
  const grouped = CATEGORY_ORDER.reduce<Record<string, ActionItem[]>>((acc, cat) => {
    const group = active.filter((i: ActionItem) => i.category === cat)
    if (group.length > 0) acc[cat] = group
    return acc
  }, {})

  async function handleCreate(values: ActionFormValues) {
    try {
      await createItem(values)
      toast.success('タスクを追加しました')
      setShowForm(false)
    } catch {
      toast.error('追加に失敗しました')
    }
  }

  async function handleToggle(id: string, completed: boolean) {
    await toggleComplete(id, completed)
  }

  async function handleDelete(id: string) {
    if (!confirm('このタスクを削除しますか？')) return
    await deleteItem(id)
    toast.success('削除しました')
  }

  return (
    <div>
      <PageHeader
        title="行動リスト"
        description={`${active.length}件のタスク`}
        action={
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? '閉じる' : '＋ 追加'}
          </Button>
        }
      />

      {showForm && (
        <div className="mx-4 mb-4 bg-card border border-border rounded-xl p-4">
          <ActionItemForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState
         
          title="タスクがありません"
          description="メモに行動アイデアを書くと自動でタスクが追加されます。手動で追加することもできます。"
          action={<Button onClick={() => setShowForm(true)}>タスクを追加</Button>}
        />
      ) : (
        <div className="px-4 space-y-6 pb-6">
          {/* Active items grouped by category */}
          {Object.entries(grouped).map(([cat, catItems]) => (
            <div key={cat}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {ACTION_CATEGORY_LABELS[cat as ActionCategory]}
              </h3>
              <div className="space-y-2">
                {catItems.map((item: ActionItem) => (
                  <ActionItemCard
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Completed section */}
          {completed.length > 0 && (
            <div>
              <Separator className="mb-4" />
              <button
                onClick={() => setShowCompleted((v) => !v)}
                className="text-xs text-muted-foreground font-medium mb-3"
              >
                {showCompleted ? '▼' : '▶'} 完了済み ({completed.length})
              </button>
              {showCompleted && (
                <div className="space-y-2">
                  {completed.map((item: ActionItem) => (
                    <ActionItemCard
                      key={item.id}
                      item={item}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
