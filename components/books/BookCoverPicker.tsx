'use client'

import { useState } from 'react'
import { ImagePlus, X, Loader2 } from 'lucide-react'

type Candidate = { thumbnail: string }

async function fetchCovers(title: string, author: string): Promise<Candidate[]> {
  const q = title || author
  const res = await fetch(`/api/book-covers?q=${encodeURIComponent(q)}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  return json.items ?? []
}

interface BookCoverPickerProps {
  bookTitle: string
  bookAuthor: string
  coverUrl: string | null
  onSelect: (url: string | null) => Promise<void>
}

export function BookCoverPicker({ bookTitle, bookAuthor, coverUrl, onSelect }: BookCoverPickerProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    setLoading(true)
    setSearched(false)
    try {
      const results = await fetchCovers(bookTitle, bookAuthor)
      setCandidates(results)
    } catch {
      setCandidates([])
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  async function handleSelect(url: string) {
    setSaving(true)
    await onSelect(url)
    setCandidates([])
    setSaving(false)
  }

  async function handleRemove() {
    setSaving(true)
    await onSelect(null)
    setSaving(false)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">表紙画像</p>

      {coverUrl ? (
        <div className="flex items-center gap-3">
          <img
            src={coverUrl}
            alt={bookTitle}
            className="w-16 h-24 object-cover rounded-lg border border-border shadow-sm shrink-0"
          />
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading || saving}
              className="flex items-center gap-1.5 text-xs text-primary hover:opacity-70 transition-opacity disabled:opacity-40"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />}
              変更
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
            >
              <X size={12} />
              削除
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading || saving}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors text-xs disabled:opacity-40"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
          表紙を検索して設定
        </button>
      )}

      {searched && candidates.length === 0 && !loading && (
        <p className="text-xs text-muted-foreground">候補が見つかりませんでした</p>
      )}

      {candidates.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">表紙を選んでください</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {candidates.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(c.thumbnail)}
                disabled={saving}
                className="shrink-0 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all disabled:opacity-40"
              >
                <img src={c.thumbnail} alt="" className="w-14 h-20 object-cover" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setCandidates([]); setSearched(false) }}
              className="shrink-0 w-14 h-20 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
