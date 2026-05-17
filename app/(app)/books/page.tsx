'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useBooks } from '@/lib/hooks/useBooks'
import { useUIStore } from '@/lib/stores/uiStore'
import { BookCard } from '@/components/books/BookCard'
import { BookFilters } from '@/components/books/BookFilters'
import { EmptyState } from '@/components/shared/EmptyState'
import { BookCardSkeleton } from '@/components/shared/Skeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import type { BookWithNoteCount } from '@/lib/types/app.types'

export default function BooksPage() {
  const { books, loading } = useBooks()
  const { searchQuery, filterStatus } = useUIStore()

  const filtered = books.filter((book: BookWithNoteCount) => {
    const matchStatus = !filterStatus || book.status === filterStatus
    const q = searchQuery.toLowerCase()
    const matchQuery =
      !q ||
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q)
    return matchStatus && matchQuery
  })

  return (
    <div>
      <PageHeader
        title="本棚"
        description={`${books.length}冊登録済み`}
      />

      <BookFilters />

      {loading ? (
        <div className="px-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pb-6">
          {[0,1,2,4].map(i => <BookCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
         
          title={books.length === 0 ? '本を登録しましょう' : '該当する本がありません'}
          description={
            books.length === 0
              ? '読んでいる本や読みたい本を追加して、読書を記録しましょう'
              : '検索条件を変えてみてください'
          }
          action={
            books.length === 0 ? (
              <Link href="/books/new">
                <Button>最初の1冊を追加</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="px-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pb-24">
          {filtered.map((book: BookWithNoteCount) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      {/* FAB */}
      <Link href="/books/new">
        <button
          type="button"
          className="fixed bottom-20 right-4 md:bottom-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={24} />
        </button>
      </Link>
    </div>
  )
}
