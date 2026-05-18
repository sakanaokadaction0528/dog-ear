import Link from 'next/link'
import { BookOpen, FileText } from 'lucide-react'
import { BookStatusBadge } from './BookStatusBadge'
import { formatDateShort } from '@/lib/utils/date'
import type { BookWithNoteCount, BookStatus } from '@/lib/types/app.types'

export function BookCard({ book }: { book: BookWithNoteCount }) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="block bg-card rounded-xl border border-border p-4
                 hover:shadow-md hover:border-primary/30 transition-all
                 active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-16 h-[6rem] object-cover rounded-lg border border-border shrink-0 shadow-sm"
          />
        ) : (
          <div className="w-16 h-[6rem] rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen size={22} className="text-primary/50" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">
                {book.title}
              </h3>
              {book.author && (
                <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
              )}
            </div>
            <BookStatusBadge status={book.status as BookStatus} />
          </div>

          {book.category && (
            <span className="inline-block text-xs text-accent-foreground bg-accent/15 rounded-full px-2.5 py-0.5 mb-2">
              {book.category}
            </span>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-2 mt-1">
            <span className="flex items-center gap-1">
              <FileText size={11} />
              {book.note_count}件のメモ
            </span>
            <span>{formatDateShort(book.updated_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
