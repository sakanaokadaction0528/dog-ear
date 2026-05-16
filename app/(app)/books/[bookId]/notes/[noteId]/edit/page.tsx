'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useNotes } from '@/lib/hooks/useNotes'
import { NoteForm } from '@/components/notes/NoteForm'
import { TopBar } from '@/components/layout/TopBar'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { ReadingNote } from '@/lib/types/app.types'
import type { NoteFormValues } from '@/lib/validators/note'

export default function EditNotePage() {
  const { bookId, noteId } = useParams<{ bookId: string; noteId: string }>()
  const { updateNote } = useNotes(bookId)
  const router = useRouter()
  const [note, setNote] = useState<ReadingNote | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    supabase
      .from('reading_notes')
      .select('*')
      .eq('id', noteId)
      .single()
      .then(({ data }) => {
        setNote(data)
        setLoading(false)
      })
  }, [noteId])

  async function handleSubmit(values: NoteFormValues) {
    try {
      await updateNote(noteId, values)
      toast.success('メモを更新しました')
      router.push(`/books/${bookId}`)
    } catch {
      toast.error('更新に失敗しました')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <TopBar title="メモを編集" showBack />
      <div className="pt-4">
        {note && (
          <NoteForm
            defaultValues={{
              read_date: note.read_date,
              read_range: note.read_range ?? '',
              quote: note.quote ?? '',
              memo: note.memo ?? '',
              insight: note.insight ?? '',
              personal_relevance: note.personal_relevance ?? '',
              action_idea: note.action_idea ?? '',
              importance: note.importance,
            }}
            onSubmit={handleSubmit}
            submitLabel="更新する"
          />
        )}
      </div>
    </div>
  )
}
