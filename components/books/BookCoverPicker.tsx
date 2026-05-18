'use client'

import { useRef, useState } from 'react'
import { Camera, ImagePlus, Loader2, X } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuthContext } from '@/lib/context/AuthContext'

type Candidate = { thumbnail: string }

async function fetchCovers(q: string): Promise<Candidate[]> {
  const res = await fetch(`/api/book-covers?q=${encodeURIComponent(q)}`)
  if (!res.ok) throw new Error('通信エラー')
  const json = await res.json()
  return json.items ?? []
}

async function compressCover(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const W = 400, H = 600
      const scale = Math.min(W / img.width, H / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.85)
    }
    img.src = url
  })
}

interface BookCoverPickerProps {
  bookId: string
  bookTitle: string
  bookAuthor: string
  coverUrl: string | null
  onSelect: (url: string | null) => Promise<void>
}

export function BookCoverPicker({ bookId, bookTitle, bookAuthor, coverUrl, onSelect }: BookCoverPickerProps) {
  const { user } = useAuthContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searched, setSearched] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSearch() {
    setLoading(true)
    setSearched(false)
    setErrorMsg(null)
    try {
      let results = await fetchCovers(bookTitle)
      if (results.length === 0 && bookAuthor) {
        results = await fetchCovers(bookAuthor)
      }
      setCandidates(results)
    } catch {
      setErrorMsg('検索できませんでした。もう一度お試しください')
      setCandidates([])
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    setErrorMsg(null)
    try {
      const compressed = await compressCover(file)
      const supabase = getSupabaseBrowserClient()
      if (!supabase) throw new Error('no client')
      const path = `${user.id}/${bookId}.jpg`
      const { error } = await supabase.storage
        .from('covers')
        .upload(path, compressed, { contentType: 'image/jpeg', upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('covers').getPublicUrl(path)
      await onSelect(`${data.publicUrl}?t=${Date.now()}`)
    } catch {
      setErrorMsg('アップロードに失敗しました')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
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

  const busy = loading || uploading || saving

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
              disabled={busy}
              className="flex items-center gap-1.5 text-xs text-primary hover:opacity-70 transition-opacity disabled:opacity-40"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />}
              検索して変更
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className="flex items-center gap-1.5 text-xs text-primary hover:opacity-70 transition-opacity disabled:opacity-40"
            >
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
              写真から変更
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
            >
              <X size={12} />
              削除
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSearch}
            disabled={busy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors text-xs disabled:opacity-40"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
            検索して設定
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors text-xs disabled:opacity-40"
          >
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
            写真から設定
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />

      {errorMsg && (
        <p className="text-xs text-destructive">{errorMsg}</p>
      )}
      {searched && !errorMsg && candidates.length === 0 && !loading && (
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
                disabled={busy}
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
