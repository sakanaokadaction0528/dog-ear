'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bookFormSchema, type BookFormValues } from '@/lib/validators/book'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const STATUS_OPTIONS = [
  { value: 'unread',   label: '未読' },
  { value: 'reading',  label: '読書中' },
  { value: 'finished', label: '読了' },
  { value: 'review',   label: '要復習' },
]

interface BookFormProps {
  defaultValues?: Partial<BookFormValues>
  onSubmit: (values: BookFormValues) => Promise<void>
  submitLabel?: string
}

export function BookForm({ defaultValues, onSubmit, submitLabel = '保存' }: BookFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: '',
      author: '',
      category: '',
      purpose: '',
      status: 'unread',
      ...defaultValues,
    },
  })

  const status = watch('status')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-4 pb-8">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">
          タイトル <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="本のタイトル"
          {...register('title')}
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Author */}
      <div className="space-y-1.5">
        <Label htmlFor="author">著者</Label>
        <Input id="author" placeholder="著者名" {...register('author')} />
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label htmlFor="category">カテゴリ</Label>
        <Input
          id="category"
          placeholder="例: ビジネス、自己啓発、投資..."
          {...register('category')}
        />
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <Label>読書ステータス</Label>
        <Select
          value={status}
          onValueChange={(v) => v && setValue('status', v as BookFormValues['status'])}
        >
          <SelectTrigger>
            <SelectValue>
              {STATUS_OPTIONS.find((o) => o.value === status)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Purpose */}
      <div className="space-y-1.5">
        <Label htmlFor="purpose">読書目的</Label>
        <Textarea
          id="purpose"
          placeholder="この本を読む目的・期待することを記録してください..."
          rows={3}
          {...register('purpose')}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? '保存中...' : submitLabel}
      </Button>
    </form>
  )
}
