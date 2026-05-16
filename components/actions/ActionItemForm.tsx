'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { actionFormSchema, type ActionFormValues } from '@/lib/validators/action'
import { ACTION_CATEGORY_LABELS, PRIORITY_LABELS } from '@/lib/types/app.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ActionItemFormProps {
  onSubmit: (values: ActionFormValues) => Promise<void>
  onCancel?: () => void
}

export function ActionItemForm({ onSubmit, onCancel }: ActionItemFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<ActionFormValues>({
    resolver: zodResolver(actionFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'this_week',
      priority: 'medium',
      due_date: '',
    },
  })

  const category = watch('category')
  const priority = watch('priority')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="action-title">
          タスク名 <span className="text-destructive">*</span>
        </Label>
        <Input id="action-title" placeholder="やること" {...register('title')} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="action-desc">詳細（任意）</Label>
        <Textarea id="action-desc" placeholder="詳細説明..." rows={2} {...register('description')} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>カテゴリ</Label>
          <Select
            value={category}
            onValueChange={(v) => v && setValue('category', v as ActionFormValues['category'])}
          >
            <SelectTrigger>
              <SelectValue>
                {ACTION_CATEGORY_LABELS[category as keyof typeof ACTION_CATEGORY_LABELS]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ACTION_CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>優先度</Label>
          <Select
            value={priority}
            onValueChange={(v) => v && setValue('priority', v as ActionFormValues['priority'])}
          >
            <SelectTrigger>
              <SelectValue>
                {PRIORITY_LABELS[priority as keyof typeof PRIORITY_LABELS]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="action-due">期限（任意）</Label>
        <Input id="action-due" type="date" {...register('due_date')} />
      </div>

      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>
            キャンセル
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? '追加中...' : '追加する'}
        </Button>
      </div>
    </form>
  )
}
