'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatDateShort } from '@/lib/utils/date'
import { ImportanceStars } from './ImportanceStars'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import type { ReadingNote } from '@/lib/types/app.types'

interface NoteCardProps {
  note: ReadingNote
  bookId: string
  onDelete?: (id: string) => void
}

export function NoteCard({ note, bookId, onDelete }: NoteCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{formatDateShort(note.read_date)}</span>
          {note.read_range && (
            <span className="text-xs bg-secondary rounded-full px-2 py-0.5">
              {note.read_range}
            </span>
          )}
        </div>
        <ImportanceStars value={note.importance} readonly />
      </div>

      {note.quote && (
        <blockquote className="border-l-2 border-accent pl-3 text-sm text-foreground/80 italic leading-relaxed">
          {note.quote}
        </blockquote>
      )}

      {note.memo && (
        <p className={cn('text-sm text-foreground leading-relaxed', !expanded && 'line-clamp-2')}>
          {note.memo}
        </p>
      )}

      {expanded && (
        <div className="space-y-2.5 pt-1 border-t border-border">
          {note.insight && (
            <div className="pt-2">
              <p className="text-xs font-medium text-muted-foreground mb-0.5">気づき</p>
              <p className="text-sm">{note.insight}</p>
            </div>
          )}
          {note.personal_relevance && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-0.5">自分との関連</p>
              <p className="text-sm">{note.personal_relevance}</p>
            </div>
          )}
          {note.action_idea && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-0.5">行動アイデア</p>
              <p className="text-sm">{note.action_idea}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded
            ? <><ChevronUp size={12} /> 閉じる</>
            : <><ChevronDown size={12} /> 詳細を見る</>
          }
        </button>
        <div className="flex-1" />
        <Link href={`/books/${bookId}/notes/${note.id}/edit`}>
          <Button variant="ghost" size="sm" className="h-7 text-xs px-2">編集</Button>
        </Link>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2 text-destructive hover:text-destructive"
            onClick={() => onDelete(note.id)}
          >
            削除
          </Button>
        )}
      </div>
    </div>
  )
}
