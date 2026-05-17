'use client'

import Link from 'next/link'
import { BookOpen, CheckSquare, FileText, Library, LogOut, User } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useBooks } from '@/lib/hooks/useBooks'
import { useActionItems } from '@/lib/hooks/useActionItems'
import { BookCard } from '@/components/books/BookCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { BookWithNoteCount, ActionItem } from '@/lib/types/app.types'

export default function MyPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { books } = useBooks()
  const { items } = useActionItems()

  const finished = books.filter((b: BookWithNoteCount) => b.status === 'finished')
  const totalNotes = books.reduce((sum: number, b: BookWithNoteCount) => sum + b.note_count, 0)
  const completedTasks = items.filter((i: ActionItem) => i.completed)

  if (authLoading) return <LoadingSpinner />

  return (
    <div className="px-4 pt-6 pb-8 space-y-6">
      {/* Profile */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <User size={32} className="text-primary" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">{user?.email ?? 'ゲスト'}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: BookOpen,    label: '読了',         value: finished.length },
          { icon: FileText,    label: 'メモ',         value: totalNotes },
          { icon: CheckSquare, label: '完了タスク',   value: completedTasks.length },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-3 text-center">
            <Icon size={16} className="text-muted-foreground mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent books */}
      {books.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Library size={14} className="text-muted-foreground" />
              <h2 className="font-semibold text-sm text-foreground">最近追加した本</h2>
            </div>
            <Link href="/books" className="text-xs text-primary">すべて見る</Link>
          </div>
          <div className="space-y-2">
            {books.slice(0, 3).map((book: BookWithNoteCount) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        <button
          type="button"
          onClick={() => { if (confirm('ログアウトしますか？')) signOut() }}
          className="w-full flex items-center gap-3 px-4 py-4 text-left text-destructive hover:bg-destructive/5 transition-colors rounded-xl"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">ログアウト</span>
        </button>
      </div>
    </div>
  )
}
