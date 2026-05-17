'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { previewBooks } from '@/lib/preview/store'
import { useAuthContext } from '@/lib/context/AuthContext'
import type { BookWithNoteCount, BookInsert, BookUpdate } from '@/lib/types/app.types'

const PREVIEW_ENABLED = process.env.NEXT_PUBLIC_PREVIEW_MODE === '1'

// Module-level cache for real Supabase mode
let booksCache: BookWithNoteCount[] | null = null
let booksCacheTime = 0
const CACHE_TTL = 60_000
const FETCH_TIMEOUT = 4000

function parseBooks(data: unknown[]): BookWithNoteCount[] {
  type RawBook = BookWithNoteCount & { reading_notes: { count: number }[] }
  return (data as RawBook[]).map((b) => ({
    ...b,
    note_count: b.reading_notes?.[0]?.count ?? 0,
  }))
}

export function useBooks() {
  const { isGuest } = useAuthContext()
  const IS_PREVIEW = PREVIEW_ENABLED && isGuest
  const [books, setBooks] = useState<BookWithNoteCount[]>(() =>
    IS_PREVIEW ? previewBooks.getAll() : (booksCache ?? [])
  )
  const [loading, setLoading] = useState(!IS_PREVIEW && booksCache === null)
  const [error, setError] = useState<string | null>(null)
  const supabase = IS_PREVIEW ? null : getSupabaseBrowserClient()

  const fetchBooks = useCallback(async (force = false) => {
    if (IS_PREVIEW) {
      setBooks(previewBooks.getAll())
      setLoading(false)
      return
    }

    const now = Date.now()
    if (!force && booksCache && now - booksCacheTime < CACHE_TTL) {
      setBooks(booksCache)
      setLoading(false)
      return
    }
    if (booksCache === null) setLoading(true)
    setError(null)

    const fallback = setTimeout(() => setLoading(false), FETCH_TIMEOUT)
    try {
      const { data, error: err } = await supabase!
        .from('books')
        .select('*, reading_notes(count)')
        .order('updated_at', { ascending: false })

      if (err) {
        setError(err.message)
      } else {
        const parsed = parseBooks(data ?? [])
        booksCache = parsed
        booksCacheTime = Date.now()
        parsed.forEach((b) => bookByIdCache.set(b.id, b))
        setBooks(parsed)
      }
    } catch {
      setError('接続できませんでした')
    } finally {
      clearTimeout(fallback)
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => { fetchBooks() }, [fetchBooks])

  async function createBook(values: Omit<BookInsert, 'user_id'>) {
    if (IS_PREVIEW) {
      const book = previewBooks.create({
        title: values.title,
        author: values.author ?? '',
        category: values.category ?? '',
        purpose: values.purpose ?? null,
        status: values.status ?? 'unread',
      })
      setBooks(previewBooks.getAll())
      return book
    }

    const { data: { user } } = await supabase!.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { data, error: err } = await supabase!
      .from('books').insert({ ...values, user_id: user.id }).select().single()
    if (err || !data) throw new Error(err?.message ?? 'Insert failed')
    booksCache = null
    await fetchBooks(true)
    return data
  }

  async function updateBook(id: string, values: BookUpdate) {
    if (IS_PREVIEW) {
      previewBooks.update(id, values)
      setBooks(previewBooks.getAll())
      return
    }
    const { error: err } = await supabase!.from('books').update(values).eq('id', id)
    if (err) throw new Error(err.message)
    booksCache = null
    await fetchBooks(true)
  }

  async function deleteBook(id: string) {
    if (IS_PREVIEW) {
      previewBooks.delete(id)
      setBooks(previewBooks.getAll())
      return
    }
    const { error: err } = await supabase!.from('books').delete().eq('id', id)
    if (err) throw new Error(err.message)
    booksCache = null
    bookByIdCache.delete(id)
    await fetchBooks(true)
  }

  return { books, loading, error, createBook, updateBook, deleteBook, refetch: () => fetchBooks(true) }
}

const bookByIdCache = new Map<string, BookWithNoteCount>()

export function useBook(id: string) {
  const { isGuest } = useAuthContext()
  const IS_PREVIEW = PREVIEW_ENABLED && isGuest
  const [book, setBook] = useState<BookWithNoteCount | null>(() =>
    IS_PREVIEW ? previewBooks.getById(id) : (bookByIdCache.get(id) ?? null)
  )
  const [loading, setLoading] = useState(!IS_PREVIEW && !bookByIdCache.has(id))
  const supabase = IS_PREVIEW ? null : getSupabaseBrowserClient()

  const fetchBook = useCallback(async () => {
    if (IS_PREVIEW) {
      setBook(previewBooks.getById(id))
      setLoading(false)
      return
    }

    if (bookByIdCache.has(id)) {
      setBook(bookByIdCache.get(id)!)
      setLoading(false)
    }
    const fallback = setTimeout(() => setLoading(false), FETCH_TIMEOUT)
    try {
      const { data } = await supabase!
        .from('books').select('*, reading_notes(count)').eq('id', id).single()
      if (data) {
        const [parsed] = parseBooks([data])
        bookByIdCache.set(id, parsed)
        setBook(parsed)
      }
    } catch {
      // ignore
    } finally {
      clearTimeout(fallback)
      setLoading(false)
    }
  }, [supabase, id])

  useEffect(() => { fetchBook() }, [fetchBook])

  return { book, loading, refetch: fetchBook }
}
