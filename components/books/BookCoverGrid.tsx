import Link from 'next/link'
import { BookStatusBadge } from './BookStatusBadge'
import type { BookWithNoteCount, BookStatus } from '@/lib/types/app.types'

export function BookCoverGrid({ books }: { books: BookWithNoteCount[] }) {
  return (
    <div className="px-4 grid grid-cols-3 gap-3 pb-24">
      {books.map((book) => (
        <Link key={book.id} href={`/books/${book.id}`} className="block active:scale-95 transition-transform">
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
      ))}
    </div>
  )
}
