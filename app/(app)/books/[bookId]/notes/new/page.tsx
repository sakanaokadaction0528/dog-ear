'use client'

import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useNotes } from '@/lib/hooks/useNotes'
import { NoteForm } from '@/components/notes/NoteForm'
import { TopBar } from '@/components/layout/TopBar'
import type { NoteFormValues } from '@/lib/validators/note'

export default function NewNotePage() {
  const { bookId } = useParams<{ bookId: string }>()
  const { createNote } = useNotes(bookId)
  const router = useRouter()

  async function handleSubmit(values: NoteFormValues) {
    try {
      await createNote(values)
      toast.success('メモを追加しました')
      router.push(`/books/${bookId}`)
    } catch {
      toast.error('メモの保存に失敗しました')
    }
  }

  return (
    <div>
      <TopBar title="読書メモを追加" showBack />
      <div className="pt-4">
        <NoteForm onSubmit={handleSubmit} submitLabel="メモを保存" />
      </div>
    </div>
  )
}
