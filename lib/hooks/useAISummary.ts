'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { previewSummaries, previewNotes, previewBooks, previewActions } from '@/lib/preview/store'
import { useAuthContext } from '@/lib/context/AuthContext'
import type { AISummaryRow, AISummaryContent } from '@/lib/types/app.types'

const PREVIEW_ENABLED = process.env.NEXT_PUBLIC_PREVIEW_MODE === '1'

const summariesCache = new Map<string, AISummaryRow[]>()
const FETCH_TIMEOUT = 4000

export function useAISummary(bookId: string) {
  const { isGuest } = useAuthContext()
  const IS_PREVIEW = PREVIEW_ENABLED && isGuest
  const [summaries, setSummaries] = useState<AISummaryRow[]>(summariesCache.get(bookId) ?? [])
  const [loading, setLoading] = useState(!summariesCache.has(bookId))
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSummaries = useCallback(async (force = false) => {
    if (!force && summariesCache.has(bookId)) {
      setSummaries(summariesCache.get(bookId)!)
      setLoading(false)
      return
    }

    if (IS_PREVIEW) {
      const rows = previewSummaries.getByBook(bookId)
      summariesCache.set(bookId, rows)
      setSummaries(rows)
      setLoading(false)
      return
    }

    if (!summariesCache.has(bookId)) setLoading(true)
    const supabase = getSupabaseBrowserClient()
    const fallback = setTimeout(() => setLoading(false), FETCH_TIMEOUT)

    try {
      const { data } = await supabase
        .from('ai_summaries')
        .select('*')
        .eq('book_id', bookId)
        .order('created_at', { ascending: false })

      const rows = data ?? []
      summariesCache.set(bookId, rows)
      setSummaries(rows)
    } catch {
      // ignore
    } finally {
      clearTimeout(fallback)
      setLoading(false)
    }
  }, [bookId])

  useEffect(() => {
    fetchSummaries()
  }, [fetchSummaries])

  async function generateSummary(): Promise<AISummaryContent | null> {
    setGenerating(true)
    setError(null)
    try {
      const body: Record<string, unknown> = { bookId }

      if (IS_PREVIEW) {
        // Send book and notes in the request so the server can work without Supabase
        const book = previewBooks.getById(bookId)
        const notes = previewNotes.getByBook(bookId)
        body.book  = book
        body.notes = notes
      }

      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || 'AI要約の生成に失敗しました')
      }
      const json = await res.json()

      if (IS_PREVIEW) {
        // Save to preview store and refresh local state
        const content: AISummaryContent = json.content
        const row = previewSummaries.create(bookId, content)

        // Persist AI-generated action items to preview store
        if (content.action_items?.length > 0) {
          content.action_items.forEach((item) => {
            previewActions.create({
              book_id: bookId,
              title: item.title,
              description: item.description || null,
              category: item.category,
              priority: item.priority,
              due_date: item.due_date || null,
              completed: false,
            })
          })
        }

        summariesCache.set(bookId, [row, ...(summariesCache.get(bookId) ?? [])])
        await fetchSummaries(true)
        return content
      }

      summariesCache.delete(bookId)
      await fetchSummaries(true)
      return json.summary?.content as AISummaryContent
    } catch (e) {
      setError(e instanceof Error ? e.message : '不明なエラー')
      return null
    } finally {
      setGenerating(false)
    }
  }

  const latestContent = summaries[0]?.content as unknown as AISummaryContent | undefined

  return { summaries, latestContent, loading, generating, error, generateSummary, refetch: () => fetchSummaries(true) }
}
