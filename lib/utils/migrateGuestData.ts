import { previewBooks, previewNotes, previewActions } from '@/lib/preview/store'
import type { SupabaseClient } from '@supabase/supabase-js'

const PREVIEW_KEYS = [
  'dog-ear-preview-books',
  'dog-ear-preview-notes',
  'dog-ear-preview-actions',
  'dog-ear-preview-summaries',
  'dog-ear-preview-posts',
  'dog-ear-preview-wants',
]

export async function migrateGuestData(userId: string, supabase: SupabaseClient) {
  const books = previewBooks.getAll()
  if (books.length === 0) return

  // bookId（localStorage）→ Supabase上の新IDのマッピング
  const bookIdMap = new Map<string, string>()

  for (const book of books) {
    const { data: inserted } = await supabase
      .from('books')
      .insert({
        title: book.title,
        author: book.author,
        category: book.category ?? '',
        purpose: book.purpose ?? null,
        status: book.status,
        user_id: userId,
      })
      .select('id')
      .single()

    if (!inserted) continue
    bookIdMap.set(book.id, inserted.id)

    const notes = previewNotes.getByBook(book.id)
    for (const note of notes) {
      await supabase.from('reading_notes').insert({
        book_id: inserted.id,
        read_date: note.read_date,
        read_range: note.read_range ?? null,
        quote: note.quote ?? null,
        memo: note.memo ?? null,
        insight: note.insight ?? null,
        personal_relevance: note.personal_relevance ?? null,
        action_idea: note.action_idea ?? null,
        importance: note.importance,
        user_id: userId,
      })
    }
  }

  const actions = previewActions.getAll()
  for (const action of actions) {
    await supabase.from('action_items').insert({
      title: action.title,
      description: action.description ?? null,
      category: action.category,
      priority: action.priority,
      due_date: action.due_date ?? null,
      completed: action.completed,
      book_id: action.book_id ? (bookIdMap.get(action.book_id) ?? null) : null,
      user_id: userId,
    })
  }

  // 移行完了後にlocalStorageを削除
  PREVIEW_KEYS.forEach((key) => localStorage.removeItem(key))
}
