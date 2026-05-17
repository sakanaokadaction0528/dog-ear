'use client'

import Link from 'next/link'
import { BookOpen, CheckSquare, FileText, Library, LogOut, Pencil, User, UserPlus } from 'lucide-react'
import { useAuthContext } from '@/lib/context/AuthContext'
import { useBooks } from '@/lib/hooks/useBooks'
import { useActionItems } from '@/lib/hooks/useActionItems'
import { useProfile } from '@/lib/hooks/useProfile'
import { useFollow } from '@/lib/hooks/useFollow'
import { BookCard } from '@/components/books/BookCard'
import { StatsSkeleton } from '@/components/shared/Skeleton'
import type { BookWithNoteCount, ActionItem } from '@/lib/types/app.types'

export default function MyPage() {
  const { user, isGuest, authLoading, signOut } = useAuthContext()
  const { books } = useBooks()
  const { items } = useActionItems()
  const { profile } = useProfile()
  const { followerCount, followingCount } = useFollow(user?.id ?? '')

  const finished = books.filter((b: BookWithNoteCount) => b.status === 'finished')
  const totalNotes = books.reduce((sum: number, b: BookWithNoteCount) => sum + b.note_count, 0)
  const completedTasks = items.filter((i: ActionItem) => i.completed)

  if (authLoading) return (
    <div className="px-4 pt-6 pb-8 space-y-6">
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
      </div>
      <StatsSkeleton />
    </div>
  )

  const displayName = profile?.nickname ?? user?.email ?? 'ゲスト'

  return (
    <div className="px-4 pt-6 pb-8 space-y-6">
      {/* Profile */}
      <div className="flex flex-col items-center gap-3 py-4 relative">
        {!isGuest && (
          <Link
            href="/mypage/edit"
            className="absolute top-0 right-0 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Pencil size={16} />
          </Link>
        )}
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="アバター" className="w-full h-full object-cover" />
          ) : (
            <User size={32} className="text-primary" />
          )}
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">{displayName}</p>
          {profile?.bio && (
            <p className="text-xs text-muted-foreground mt-1 max-w-[240px] leading-relaxed">{profile.bio}</p>
          )}
        </div>
        {!isGuest && (
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">{followerCount}</p>
              <p className="text-xs text-muted-foreground">フォロワー</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">{followingCount}</p>
              <p className="text-xs text-muted-foreground">フォロー中</p>
            </div>
          </div>
        )}
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
      <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
        {isGuest ? (
          <>
            <Link
              href="/register"
              className="w-full flex items-center gap-3 px-4 py-4 text-left text-primary hover:bg-primary/5 transition-colors"
            >
              <UserPlus size={16} />
              <div>
                <p className="text-sm font-medium">アカウントを作成する</p>
                <p className="text-xs text-muted-foreground">本・メモのデータを引き継げます</p>
              </div>
            </Link>
            <Link
              href="/login"
              className="w-full flex items-center gap-3 px-4 py-4 text-left text-muted-foreground hover:bg-secondary transition-colors"
            >
              <User size={16} />
              <span className="text-sm font-medium">ログイン</span>
            </Link>
          </>
        ) : (
          <button
            type="button"
            onClick={() => { if (confirm('ログアウトしますか？')) signOut() }}
            className="w-full flex items-center gap-3 px-4 py-4 text-left text-destructive hover:bg-destructive/5 transition-colors"
          >
            <LogOut size={16} />
            <span className="text-sm font-medium">ログアウト</span>
          </button>
        )}
      </div>
    </div>
  )
}
