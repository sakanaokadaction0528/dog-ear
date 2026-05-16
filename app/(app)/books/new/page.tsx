'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useBooks } from '@/lib/hooks/useBooks'
import { BookForm } from '@/components/books/BookForm'
import { TopBar } from '@/components/layout/TopBar'
import type { BookFormValues } from '@/lib/validators/book'

export default function NewBookPage() {
  const router = useRouter()
  const { createBook } = useBooks()

  async function handleSubmit(values: BookFormValues) {
    try {
      const book = await createBook(values)
      toast.success('本を登録しました')
      router.push(`/books/${book.id}`)
    } catch (e) {
      toast.error('登録に失敗しました')
      throw e
    }
  }

  return (
    <div>
      <TopBar title="本を追加" showBack />
      <div className="pt-4">
        <BookForm onSubmit={handleSubmit} submitLabel="登録する" />
      </div>
    </div>
  )
}
