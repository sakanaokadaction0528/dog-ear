'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { previewNotes } from '@/lib/preview/store'
import type { ReadingNote, ReadingNoteInsert } from '@/lib/types/app.types'

const IS_PREVIEW = process.env.NEXT_PUBLIC_PREVIEW_MODE === '1'

const notesCache = new Map<string, ReadingNote[]>()
const notesCacheTime = new Map<string, number>()
const CACHE_TTL = 60_000
const FETCH_TIMEOUT = 4000

export function useNotes(bookId: string) {
  const [notes, setNotes] = useState<ReadingNote[]>(() =>
    IS_PREVIEW ? previewNotes.getByBook(bookId) : (notesCache.get(bookId) ?? [])
  )
  const [loading, setLoading] = useState(!IS_PREVIEW && !notesCache.has(bookId))
  const supabase = IS_PREVIEW ? null : getSupabaseBrowserClient()

  const fetchNotes = useCallback(async (force = false) => {
    if (IS_PREVIEW) {
      setNotes(previewNotes.getByBook(bookId))
      setLoading(false)
      return
    }

    const now = Date.now()
    const cached = notesCache.get(bookId)
    if (!force && cached && now - (notesCacheTime.get(bookId) ?? 0) < CACHE_TTL) {
      setNotes(cached)
      setLoading(false)
      return
    }
    if (!cached) setLoading(true)

    const fallback = setTimeout(() => setLoading(false), FETCH_TIMEOUT)
    try {
      const { data } = await supabase!
        .from('reading_notes').select('*').eq('book_id', bookId)
        .order('read_date', { ascending: false })
      const rows = data ?? []
      notesCache.set(bookId, rows)
      notesCacheTime.set(bookId, Date.now())
      setNotes(rows)
    } catch {
      // ignore
    } finally {
      clearTimeout(fallback)
      setLoading(false)
    }
  }, [supabase, bookId])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  async function createNote(values: Omit<ReadingNoteInsert, 'book_id'>) {
    if (IS_PREVIEW) {
      const note = previewNotes.create(bookId, {
        read_date: values.read_date ?? new Date().toISOString().slice(0, 10),
        read_range: values.read_range ?? null,
        quote: values.quote ?? null,
        memo: values.memo ?? null,
        insight: values.insight ?? null,
        personal_relevance: values.personal_relevance ?? null,
        action_idea: values.action_idea ?? null,
        importance: values.importance ?? 3,
      })
      setNotes(previewNotes.getByBook(bookId))
      return note
    }
    const { data, error } = await supabase!
      .from('reading_notes').insert({ ...values, book_id: bookId }).select().single()
    if (error) throw new Error(error.message)
    notesCache.delete(bookId)
    await fetchNotes(true)
    return data
  }

  async function updateNote(id: string, values: Partial<ReadingNoteInsert>) {
    if (IS_PREVIEW) {
      previewNotes.update(id, values)
      setNotes(previewNotes.getByBook(bookId))
      return
    }
    const { error } = await supabase!.from('reading_notes').update(values).eq('id', id)
    if (error) throw new Error(error.message)
    notesCache.delete(bookId)
    await fetchNotes(true)
  }

  async function deleteNote(id: string) {
    if (IS_PREVIEW) {
      previewNotes.delete(id)
      setNotes(previewNotes.getByBook(bookId))
      return
    }
    const { error } = await supabase!.from('reading_notes').delete().eq('id', id)
    if (error) throw new Error(error.message)
    notesCache.delete(bookId)
    await fetchNotes(true)
  }

  return { notes, loading, createNote, updateNote, deleteNote, refetch: () => fetchNotes(true) }
}
