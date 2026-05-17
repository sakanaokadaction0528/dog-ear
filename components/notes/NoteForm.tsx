'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { noteFormSchema, type NoteFormValues } from '@/lib/validators/note'
import { todayISO } from '@/lib/utils/date'
import { ImportanceStars } from './ImportanceStars'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface NoteFormProps {
  defaultValues?: Partial<NoteFormValues>
  onSubmit: (values: NoteFormValues) => Promise<void>
  submitLabel?: string
}

export function NoteForm({ defaultValues, onSubmit, submitLabel = '保存' }: NoteFormProps) {
  const [detailOpen, setDetailOpen] = useState(
    !!(defaultValues?.insight || defaultValues?.personal_relevance || defaultValues?.action_idea)
  )

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      read_date: todayISO(),
      read_range: '',
      quote: '',
      memo: '',
      insight: '',
      personal_relevance: '',
      action_idea: '',
      importance: 3,
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4 pb-8">
      {/* 日付・範囲・重要度 を1行に */}
      <div className="flex items-center gap-2">
        <Input
          type="date"
          className="w-36 shrink-0 text-sm"
          {...register('read_date')}
        />
        <Input
          placeholder="範囲 (例: p.1-50)"
          className="flex-1 text-sm"
          {...register('read_range')}
        />
        <Controller
          name="importance"
          control={control}
          render={({ field }) => (
            <ImportanceStars value={field.value} onChange={field.onChange} />
          )}
        />
      </div>
      {errors.read_date && (
        <p className="text-xs text-destructive -mt-2">{errors.read_date.message}</p>
      )}

      {/* メモ（メイン） */}
      <Textarea
        placeholder="読んで感じたこと、気づいたこと、まとめ..."
        rows={6}
        autoFocus
        {...register('memo')}
      />

      {/* 引用 */}
      <Textarea
        placeholder="印象に残った一文（引用）"
        rows={2}
        {...register('quote')}
      />

      {/* 詳細トグル */}
      <button
        type="button"
        onClick={() => setDetailOpen((v) => !v)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {detailOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        {detailOpen ? '詳細を閉じる' : '詳細を追加（気づき・自分との関連・行動アイデア）'}
      </button>

      {detailOpen && (
        <div className="space-y-4 pt-1 border-t border-border">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">気づき</p>
            <Textarea
              placeholder="読んでハッとしたこと..."
              rows={2}
              {...register('insight')}
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">今の自分との関連</p>
            <Textarea
              placeholder="自分の状況・仕事・生活にどう関係するか..."
              rows={2}
              {...register('personal_relevance')}
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">行動アイデア</p>
            <Textarea
              placeholder="実際にやってみたいこと..."
              rows={2}
              {...register('action_idea')}
            />
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? '保存中...' : submitLabel}
      </Button>
    </form>
  )
}
