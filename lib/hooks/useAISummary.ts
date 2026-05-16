'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { AISummaryRow, AISummaryContent } from '@/lib/types/app.types'

const summariesCache = new Map<string, AISummaryRow[]>()
const FETCH_TIMEOUT = 4000

export function useAISummary(bookId: string) {
  const [summaries, setSummaries] = useState<AISummaryRow[]>(summariesCache.get(bookId) ?? [])
  const [loading, setLoading] = useState(!summariesCache.has(bookId))
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  const fetchSummaries = useCallback(async (force = false) => {
    if (!force && summariesCache.has(bookId)) {
      setSummaries(summariesCache.get(bookId)!)
      setLoading(false)
      return
    }
    if (!summariesCache.has(bookId)) setLoading(true)

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
  }, [supabase, bookId])

  useEffect(() => {
    fetchSummaries()
  }, [fetchSummaries])

  async function generateSummary(): Promise<AISummaryContent | null> {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'AI要約の生成に失敗しました')
      }
      const json = await res.json()
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
