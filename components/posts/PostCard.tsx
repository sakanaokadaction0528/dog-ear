'use client'

import { useState } from 'react'
import { Heart, BookOpen, Trash2 } from 'lucide-react'
import { formatDateShort } from '@/lib/utils/date'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import type { Post } from '@/lib/types/app.types'

interface PostCardProps {
  post: Post & { is_wanted: boolean }
  onToggleWant: (postId: string) => void
  onDelete?: (postId: string) => void
  isOwner?: boolean
}

export function PostCard({ post, onToggleWant, onDelete, isOwner }: PostCardProps) {
  const [imgExpanded, setImgExpanded] = useState(false)

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Book info header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-border/50">
        <BookOpen size={14} className="text-primary shrink-0" strokeWidth={1.8} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{post.book_title}</p>
          {post.book_author && (
            <p className="text-xs text-muted-foreground truncate">{post.book_author}</p>
          )}
        </div>
      </div>

      {/* Photo */}
      {post.image_url && (
        <button
          className="w-full block"
          onClick={() => setImgExpanded((v) => !v)}
        >
          <img
            src={post.image_url}
            alt="投稿画像"
            className={cn(
              'w-full object-cover transition-all',
              imgExpanded ? 'max-h-[600px]' : 'max-h-52'
            )}
          />
        </button>
      )}

      {/* Comment */}
      {post.comment && (
        <p className="px-4 py-3 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {post.comment}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 pb-4 pt-1">
        <span className="text-xs text-muted-foreground">{formatDateShort(post.created_at)}</span>
        <div className="flex items-center gap-2">
          {isOwner && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(post.id)}
            >
              <Trash2 size={13} />
            </Button>
          )}
          <button
            onClick={() => onToggleWant(post.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              post.is_wanted
                ? 'bg-rose-50 text-rose-500 border border-rose-200'
                : 'bg-secondary text-muted-foreground border border-border hover:border-rose-200 hover:text-rose-400'
            )}
          >
            <Heart
              size={13}
              className={cn(post.is_wanted && 'fill-rose-500')}
              strokeWidth={post.is_wanted ? 0 : 1.8}
            />
            読みたい！
            <span>{post.want_count}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
