'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
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

type CoverCandidate = { thumbnail: string; title: string; author: string }

async function fetchCovers(title: string, author: string): Promise<CoverCandidate[]> {
  const parts = [`intitle:${title}`]
  if (author) parts.push(`inauthor:${author}`)
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(parts.join('+'))}&maxResults=8`
  const res = await fetch(url)
  if (!res.ok) return []
  const json = await res.json()
  return (json.items ?? [])
    .filter((item: unknown) => {
      const v = (item as { volumeInfo?: { imageLinks?: { thumbnail?: string } } }).volumeInfo
      return v?.imageLinks?.thumbnail
    })
    .map((item: unknown) => {
      const v = (item as { volumeInfo: { title: string; authors?: string[]; imageLinks: { thumbnail: string } } }).volumeInfo
      return {
        thumbnail: v.imageLinks.thumbnail.replace('http://', 'https://'),
        title: v.title,
        author: v.authors?.[0] ?? '',
      }
    })
}

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
      cover_url: null,
      ...defaultValues,
    },
  })

  const status = watch('status')
  const coverUrl = watch('cover_url')
  const title = watch('title')
  const author = watch('author')

  const [candidates, setCandidates] = useState<CoverCandidate[]>([])
  const [loadingCover, setLoadingCover] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (coverUrl) { setCandidates([]); return }
    if (!title || title.length < 2) { setCandidates([]); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoadingCover(true)
      const results = await fetchCovers(title, author)
      setCandidates(results)
      setLoadingCover(false)
    }, 700)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [title, author, coverUrl])

  function selectCover(url: string) {
    setValue('cover_url', url)
    setCandidates([])
  }

  function clearCover() {
    setValue('cover_url', null)
  }

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

      {/* Cover picker */}
      <div className="space-y-2">
        <Label>表紙画像</Label>
        {coverUrl ? (
          <div className="flex items-center gap-3">
            <img
              src={coverUrl}
              alt="表紙"
              className="w-14 h-20 object-cover rounded-lg border border-border shadow-sm"
            />
            <button
              type="button"
              onClick={clearCover}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <X size={12} />
              削除
            </button>
          </div>
        ) : loadingCover ? (
          <p className="text-xs text-muted-foreground">検索中...</p>
        ) : candidates.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">表紙を選んでください</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {candidates.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectCover(c.thumbnail)}
                  className="shrink-0 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all focus:outline-none focus:border-primary"
                >
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    className="w-14 h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        ) : null}
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
