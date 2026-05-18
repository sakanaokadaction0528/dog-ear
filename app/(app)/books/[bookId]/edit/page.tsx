'use client'

import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useBook, useBooks } from '@/lib/hooks/useBooks'
import { BookForm } from '@/components/books/BookForm'
import { TopBar } from '@/components/layout/TopBar'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { BookFormValues } from '@/lib/validators/book'

export default function EditBookPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const { book, loading } = useBook(bookId)
  const { updateBook } = useBooks()
  const router = useRouter()

  async function handleSubmit(values: BookFormValues) {
    try {
      await updateBook(bookId, values)
      toast.success('更新しました')
      router.push(`/books/${bookId}`)
    } catch {
      toast.error('更新に失敗しました')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <TopBar title="本を編集" showBack />
      <div className="pt-4">
        {book && (
          <BookForm
            defaultValues={{
              title:     book.title,
              author:    book.author,
              category:  book.category,
              purpose:   book.purpose ?? '',
              status:    book.status as BookFormValues['status'],
              cover_url: book.cover_url ?? null,
            }}
            onSubmit={handleSubmit}
            submitLabel="保存する"
          />
        )}
      </div>
    </div>
  )
}
