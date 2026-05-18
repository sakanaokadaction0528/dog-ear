'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ScanLine, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useBooks } from '@/lib/hooks/useBooks'
import { BookForm } from '@/components/books/BookForm'
import { BarcodeScanner } from '@/components/books/BarcodeScanner'
import { TopBar } from '@/components/layout/TopBar'
import type { BookFormValues } from '@/lib/validators/book'

export default function NewBookPage() {
  const router = useRouter()
  const { createBook } = useBooks()
  const [scanning, setScanning] = useState(false)
  const [looking, setLooking] = useState(false)
  const [prefill, setPrefill] = useState<Partial<BookFormValues> | null>(null)

  async function handleSubmit(values: BookFormValues) {
    try {
      const book = await createBook(values)
      toast.success('本を登録しました')
      router.push(`/books/${book.id}`)
    } catch {
      toast.error('登録に失敗しました')
    }
  }

  async function handleDetected(isbn: string) {
    setScanning(false)
    setLooking(true)
    try {
      const res = await fetch(`/api/book-isbn?isbn=${isbn}`)
      const data = await res.json()
      if (data.found) {
        setPrefill({
          title: data.title,
          author: data.author,
          cover_url: data.cover_url,
        })
        toast.success('本の情報を取得しました')
      } else {
        toast.error('書籍情報が見つかりませんでした')
      }
    } catch {
      toast.error('情報の取得に失敗しました')
    } finally {
      setLooking(false)
    }
  }

  return (
    <div>
      <TopBar title="本を追加" showBack />

      {scanning && (
        <BarcodeScanner
          onDetected={handleDetected}
          onClose={() => setScanning(false)}
        />
      )}

      <div className="pt-4">
        {/* Scan button */}
        <div className="px-4 mb-4">
          <button
            type="button"
            onClick={() => setScanning(true)}
            disabled={looking}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-primary/40 text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
          >
            {looking
              ? <><Loader2 size={18} className="animate-spin" />書籍情報を検索中...</>
              : <><ScanLine size={18} />バーコードをスキャンして登録</>
            }
          </button>
        </div>

        <div className="flex items-center gap-3 px-4 mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">または手動で入力</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <BookForm
          key={JSON.stringify(prefill)}
          defaultValues={prefill ?? undefined}
          onSubmit={handleSubmit}
          submitLabel="登録する"
        />
      </div>
    </div>
  )
}
