'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { useBooks } from '@/lib/hooks/useBooks'
import { usePosts } from '@/lib/hooks/usePosts'
import { PostForm } from '@/components/posts/PostForm'
import { TopBar } from '@/components/layout/TopBar'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { cn } from '@/lib/utils/cn'
import type { BookWithNoteCount } from '@/lib/types/app.types'

export default function NewPostPage() {
  const { books, loading } = useBooks()
  const { createPost } = usePosts()
  const router = useRouter()
  const [selected, setSelected] = useState<BookWithNoteCount | null>(null)

  async function handlePost(values: { comment: string; image_url: string | null }) {
    if (!selected) return
    await createPost({
      book_id: selected.id,
      book_title: selected.title,
      book_author: selected.author,
      comment: values.comment,
      image_url: values.image_url,
    })
    toast.success('投稿しました！')
    router.push('/feed')
  }

  return (
    <div>
      <TopBar title="おすすめを投稿" showBack />

      <div className="px-4 pt-4 pb-8 space-y-5">
        {/* Book picker */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">紹介する本を選ぶ</p>
          {loading ? (
            <LoadingSpinner />
          ) : books.length === 0 ? (
            <p className="text-sm text-muted-foreground">本棚に本がありません</p>
          ) : (
            <div className="space-y-2">
              {books.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => setSelected(book)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors',
                    selected?.id === book.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/40'
                  )}
                >
                  <BookOpen
                    size={16}
                    className={selected?.id === book.id ? 'text-primary' : 'text-muted-foreground'}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{book.title}</p>
                    {book.author && (
                      <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Post form — shown once a book is selected */}
        {selected && (
          <div className="border-t border-border pt-5">
            <PostForm
              bookTitle={selected.title}
              bookAuthor={selected.author}
              onSubmit={handlePost}
              onCancel={() => setSelected(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
