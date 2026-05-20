'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { previewBooks } from '@/lib/preview/store'
import { useAuthContext } from '@/lib/context/AuthContext'
import type { BookWithNoteCount, BookInsert, BookUpdate } from '@/lib/types/app.types'

const PREVIEW_ENABLED = process.env.NEXT_PUBLIC_PREVIEW_MODE === '1'

// Module-level cache keyed by userId so accounts never share cached data
const booksCacheByUser = new Map<string, BookWithNoteCount[]>()
const booksCacheTimeByUser = new Map<string, number>()
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
  const { isGuest, user } = useAuthContext()
  const IS_PREVIEW = PREVIEW_ENABLED && isGuest
  const userId = user?.id ?? ''
  const [books, setBooks] = useState<BookWithNoteCount[]>(() =>
    IS_PREVIEW ? previewBooks.getAll() : (booksCacheByUser.get(userId) ?? [])
  )
  const [loading, setLoading] = useState(!IS_PREVIEW && !booksCacheByUser.has(userId))
  const [error, setError] = useState<string | null>(null)
  const supabase = IS_PREVIEW ? null : getSupabaseBrowserClient()

  const fetchBooks = useCallback(async (force = false) => {
    if (IS_PREVIEW) {
      setBooks(previewBooks.getAll())
      setLoading(false)
      return
    }

    const now = Date.now()
    const cached = booksCacheByUser.get(userId)
    const cachedAt = booksCacheTimeByUser.get(userId) ?? 0
    if (!force && cached && now - cachedAt < CACHE_TTL) {
      setBooks(cached)
      setLoading(false)
      return
    }
    if (!cached) setLoading(true)
    setError(null)

    if (!userId) { setLoading(false); return } // 未認証なら何もしない

    const fallback = setTimeout(() => setLoading(false), FETCH_TIMEOUT)
    try {
      const { data, error: err } = await supabase!
        .from('books')
        .select('*, reading_notes(count)')
        .eq('user_id', userId)                  // RLS に加えて明示的にフィルター
        .order('updated_at', { ascending: false })

      if (err) {
        setError(err.message)
      } else {
        const parsed = parseBooks(data ?? [])
        booksCacheByUser.set(userId, parsed)
        booksCacheTimeByUser.set(userId, Date.now())
        const userBookCache = bookByIdCacheByUser.get(userId) ?? new Map()
        parsed.forEach((b) => userBookCache.set(b.id, b))
        bookByIdCacheByUser.set(userId, userBookCache)
        setBooks(parsed)
      }
    } catch {
      setError('接続できませんでした')
    } finally {
      clearTimeout(fallback)
      setLoading(false)
    }
  }, [supabase, userId])

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
    booksCacheByUser.delete(userId)
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
    booksCacheByUser.delete(userId)
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
    booksCacheByUser.delete(userId)
    bookByIdCacheByUser.get(userId)?.delete(id)
    await fetchBooks(true)
  }

  async function toggleFavorite(id: string) {
    const book = books.find(b => b.id === id)
    if (!book) return
    await updateBook(id, { is_favorite: !book.is_favorite })
  }

  return { books, loading, error, createBook, updateBook, deleteBook, toggleFavorite, refetch: () => fetchBooks(true) }
}

const bookByIdCacheByUser = new Map<string, Map<string, BookWithNoteCount>>()

export function useBook(id: string) {
  const { isGuest, user } = useAuthContext()
  const IS_PREVIEW = PREVIEW_ENABLED && isGuest
  const userId = user?.id ?? ''
  const userBookCache = bookByIdCacheByUser.get(userId) ?? new Map()
  const [book, setBook] = useState<BookWithNoteCount | null>(() =>
    IS_PREVIEW ? previewBooks.getById(id) : (userBookCache.get(id) ?? null)
  )
  const [loading, setLoading] = useState(!IS_PREVIEW && !userBookCache.has(id))
  const supabase = IS_PREVIEW ? null : getSupabaseBrowserClient()

  const fetchBook = useCallback(async () => {
    if (IS_PREVIEW) {
      setBook(previewBooks.getById(id))
      setLoading(false)
      return
    }

    const cache = bookByIdCacheByUser.get(userId) ?? new Map()
    if (cache.has(id)) {
      setBook(cache.get(id)!)
      setLoading(false)
    }
    const fallback = setTimeout(() => setLoading(false), FETCH_TIMEOUT)
    try {
      const { data } = await supabase!
        .from('books').select('*, reading_notes(count)')
        .eq('id', id).eq('user_id', userId).single()
      if (data) {
        const [parsed] = parseBooks([data])
        cache.set(id, parsed)
        bookByIdCacheByUser.set(userId, cache)
        setBook(parsed)
      }
    } catch {
      // ignore
    } finally {
      clearTimeout(fallback)
      setLoading(false)
    }
  }, [supabase, id, userId])

  useEffect(() => { fetchBook() }, [fetchBook])

  return { book, loading, refetch: fetchBook }
}
