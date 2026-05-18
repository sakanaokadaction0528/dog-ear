import Link from 'next/link'
import { Star } from 'lucide-react'
import { BookStatusBadge } from './BookStatusBadge'
import { cn } from '@/lib/utils/cn'
import type { BookWithNoteCount, BookStatus } from '@/lib/types/app.types'

interface BookCoverGridProps {
  books: BookWithNoteCount[]
  onToggleFavorite: (id: string) => void
}

export function BookCoverGrid({ books, onToggleFavorite }: BookCoverGridProps) {
  return (
    <div className="px-4 grid grid-cols-3 gap-3 pb-24">
      {books.map((book) => (
        <div key={book.id} className="relative">
          <Link href={`/books/${book.id}`} className="block active:scale-95 transition-transform">
            <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden border border-border shadow-sm">
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex flex-col items-center justify-center p-2 gap-1">
                  <p className="text-[11px] font-semibold text-foreground text-center leading-snug line-clamp-4">
                    {book.title}
                  </p>
                  {book.author && (
                    <p className="text-[9px] text-muted-foreground text-center line-clamp-2 mt-1">
                      {book.author}
                    </p>
                  )}
                </div>
              )}
              {/* ステータスバッジ */}
              <div className="absolute top-1 right-1">
                <BookStatusBadge status={book.status as BookStatus} mini />
              </div>
            </div>
          </Link>

          {/* お気に入りボタン */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onToggleFavorite(book.id) }}
            className="absolute top-1 left-1 w-6 h-6 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm"
          >
            <Star
              size={13}
              className={cn(
                book.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-white'
              )}
              strokeWidth={book.is_favorite ? 0 : 1.5}
            />
          </button>
        </div>
      ))}
    </div>
  )
}
