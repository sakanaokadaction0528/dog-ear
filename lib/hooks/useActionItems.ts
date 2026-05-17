'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { previewActions } from '@/lib/preview/store'
import { useAuthContext } from '@/lib/context/AuthContext'
import type { ActionItem, ActionItemInsert } from '@/lib/types/app.types'

const PREVIEW_ENABLED = process.env.NEXT_PUBLIC_PREVIEW_MODE === '1'

let allItemsCache: ActionItem[] | null = null
let allItemsCacheTime = 0
const CACHE_TTL = 60_000
const FETCH_TIMEOUT = 4000

export function useActionItems(bookId?: string) {
  const { isGuest } = useAuthContext()
  const IS_PREVIEW = PREVIEW_ENABLED && isGuest
  const [items, setItems] = useState<ActionItem[]>(() => {
    if (IS_PREVIEW) {
      return bookId ? previewActions.getByBook(bookId) : previewActions.getAll()
    }
    if (!allItemsCache) return []
    return bookId ? allItemsCache.filter((i) => i.book_id === bookId) : allItemsCache
  })
  const [loading, setLoading] = useState(!IS_PREVIEW && allItemsCache === null)
  const supabase = IS_PREVIEW ? null : getSupabaseBrowserClient()

  const fetchItems = useCallback(async (force = false) => {
    if (IS_PREVIEW) {
      setItems(bookId ? previewActions.getByBook(bookId) : previewActions.getAll())
      setLoading(false)
      return
    }

    const now = Date.now()
    if (!force && allItemsCache && now - allItemsCacheTime < CACHE_TTL) {
      setItems(bookId ? allItemsCache.filter((i) => i.book_id === bookId) : allItemsCache)
      setLoading(false)
      return
    }
    if (allItemsCache === null) setLoading(true)

    const fallback = setTimeout(() => setLoading(false), FETCH_TIMEOUT)
    try {
      const { data } = await supabase!
        .from('action_items').select('*').order('created_at', { ascending: false })
      const all = data ?? []
      allItemsCache = all
      allItemsCacheTime = Date.now()
      setItems(bookId ? all.filter((i) => i.book_id === bookId) : all)
    } catch {
      // ignore
    } finally {
      clearTimeout(fallback)
      setLoading(false)
    }
  }, [supabase, bookId])

  useEffect(() => { fetchItems() }, [fetchItems])

  async function createItem(values: Omit<ActionItemInsert, 'user_id'>) {
    if (IS_PREVIEW) {
      const item = previewActions.create({
        title: values.title,
        description: values.description ?? null,
        category: values.category ?? 'this_week',
        priority: values.priority ?? 'medium',
        due_date: values.due_date ?? null,
        completed: false,
        book_id: values.book_id ?? null,
      })
      setItems(bookId ? previewActions.getByBook(bookId) : previewActions.getAll())
      return item
    }
    const { data: { user } } = await supabase!.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { data, error } = await supabase!
      .from('action_items').insert({ ...values, user_id: user.id }).select().single()
    if (error) throw new Error(error.message)
    allItemsCache = null
    await fetchItems(true)
    return data
  }

  async function toggleComplete(id: string, completed: boolean) {
    if (IS_PREVIEW) {
      previewActions.toggle(id, completed)
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, completed } : i)))
      return
    }
    const { error } = await supabase!.from('action_items').update({ completed }).eq('id', id)
    if (error) throw new Error(error.message)
    if (allItemsCache) {
      allItemsCache = allItemsCache.map((i) => (i.id === id ? { ...i, completed } : i))
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, completed } : i)))
  }

  async function deleteItem(id: string) {
    if (IS_PREVIEW) {
      previewActions.delete(id)
      setItems(bookId ? previewActions.getByBook(bookId) : previewActions.getAll())
      return
    }
    const { error } = await supabase!.from('action_items').delete().eq('id', id)
    if (error) throw new Error(error.message)
    allItemsCache = null
    await fetchItems(true)
  }

  return { items, loading, createItem, toggleComplete, deleteItem, refetch: () => fetchItems(true) }
}
