'use client'

import { useState, useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface PostFormProps {
  bookTitle: string
  bookAuthor: string
  onSubmit: (values: { comment: string; image_url: string | null }) => Promise<void>
  onCancel?: () => void
}

export function PostForm({ bookTitle, bookAuthor, onSubmit, onCancel }: PostFormProps) {
  const [comment, setComment] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImageUrl(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim() && !imageUrl) return
    setSubmitting(true)
    try {
      await onSubmit({ comment: comment.trim(), image_url: imageUrl })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Book info display */}
      <div className="bg-secondary/50 rounded-lg px-3 py-2">
        <p className="text-xs text-muted-foreground">紹介する本</p>
        <p className="text-sm font-medium text-foreground truncate">{bookTitle}</p>
        {bookAuthor && <p className="text-xs text-muted-foreground truncate">{bookAuthor}</p>}
      </div>

      {/* Photo upload */}
      <div className="space-y-2">
        <Label>写真（任意）</Label>
        {imageUrl ? (
          <div className="relative">
            <img
              src={imageUrl}
              alt="プレビュー"
              className="w-full max-h-56 object-cover rounded-lg border border-border"
            />
            <button
              type="button"
              onClick={() => { setImageUrl(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
          >
            <ImagePlus size={24} strokeWidth={1.5} />
            <span className="text-xs">タップして写真を追加</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Comment */}
      <div className="space-y-1.5">
        <Label htmlFor="post-comment">コメント（任意）</Label>
        <Textarea
          id="post-comment"
          placeholder="この本のここが良かった、こんな人におすすめ..."
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>
            キャンセル
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1"
          disabled={submitting || (!comment.trim() && !imageUrl)}
        >
          {submitting ? '投稿中...' : '投稿する'}
        </Button>
      </div>
    </form>
  )
}
