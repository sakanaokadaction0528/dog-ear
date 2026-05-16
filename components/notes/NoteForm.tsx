'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { noteFormSchema, type NoteFormValues } from '@/lib/validators/note'
import { todayISO } from '@/lib/utils/date'
import { ImportanceStars } from './ImportanceStars'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface NoteFormProps {
  defaultValues?: Partial<NoteFormValues>
  onSubmit: (values: NoteFormValues) => Promise<void>
  submitLabel?: string
}

export function NoteForm({ defaultValues, onSubmit, submitLabel = '保存' }: NoteFormProps) {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-4 pb-8">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="read_date">
            読んだ日 <span className="text-destructive">*</span>
          </Label>
          <Input id="read_date" type="date" {...register('read_date')} />
          {errors.read_date && (
            <p className="text-xs text-destructive">{errors.read_date.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="read_range">読んだ範囲</Label>
          <Input id="read_range" placeholder="例: p.1-50" {...register('read_range')} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>重要度</Label>
        <Controller
          name="importance"
          control={control}
          render={({ field }) => (
            <ImportanceStars value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="quote">印象に残った文章</Label>
        <Textarea
          id="quote"
          placeholder="本から引用した文章や印象に残ったフレーズ..."
          rows={3}
          {...register('quote')}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="memo">内容メモ</Label>
        <Textarea
          id="memo"
          placeholder="読んだ内容のまとめや要点..."
          rows={4}
          {...register('memo')}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="insight">気づき</Label>
        <Textarea
          id="insight"
          placeholder="読んで気づいたこと、ハッとしたこと..."
          rows={3}
          {...register('insight')}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="personal_relevance">今の自分との関連</Label>
        <Textarea
          id="personal_relevance"
          placeholder="今の自分の状況・仕事・生活にどう関係するか..."
          rows={3}
          {...register('personal_relevance')}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="action_idea">行動に移せそうなこと</Label>
        <Textarea
          id="action_idea"
          placeholder="この内容から実際にやってみたいこと..."
          rows={2}
          {...register('action_idea')}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? '保存中...' : submitLabel}
      </Button>
    </form>
  )
}
