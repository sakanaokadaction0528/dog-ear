'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, CheckSquare, ChevronDown, ChevronUp } from 'lucide-react'
import { useBooks } from '@/lib/hooks/useBooks'
import { useActionItems } from '@/lib/hooks/useActionItems'
import { BookCard } from '@/components/books/BookCard'
import { ActionItemCard } from '@/components/actions/ActionItemCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { BookCardSkeleton, StatsSkeleton } from '@/components/shared/Skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { BookWithNoteCount, ActionItem } from '@/lib/types/app.types'

export default function DashboardPage() {
  const { books, loading: booksLoading } = useBooks()
  const { items, loading: actionsLoading, toggleComplete } = useActionItems()
  const [readingOpen, setReadingOpen] = useState(false)

  const reading = books.filter((b: BookWithNoteCount) => b.status === 'reading')
  const finished = books.filter((b: BookWithNoteCount) => b.status === 'finished')
  const pendingTasks = items.filter((i: ActionItem) => !i.completed)

  if (booksLoading) return (
    <div className="px-4 pt-5 pb-6 space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-muted animate-pulse" />
        <div className="space-y-1.5">
          <div className="h-5 w-20 rounded bg-muted animate-pulse" />
          <div className="h-3 w-32 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <StatsSkeleton />
      <div className="space-y-2">
        <BookCardSkeleton />
        <BookCardSkeleton />
      </div>
    </div>
  )

  return (
    <div className="px-4 pt-5 pb-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <Image src="/icon-192.png" alt="Dog Ear" width={36} height={36} className="rounded-lg" />
        <div>
          <h1 className="text-xl font-bold text-foreground">Dog Ear</h1>
          <p className="text-sm text-muted-foreground mt-0.5">読書を、行動に変えよう</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '読書中', value: reading.length, color: 'text-primary' },
          { label: '読了',   value: finished.length, color: 'text-green-600' },
          { label: 'タスク', value: pendingTasks.length, color: 'text-foreground' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tasks */}
      <section>
        <div className="flex items-center gap-1.5 mb-3">
          <CheckSquare size={14} className="text-muted-foreground" />
          <h2 className="font-semibold text-sm text-foreground">タスク</h2>
          {pendingTasks.length > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">{pendingTasks.length}件</span>
          )}
        </div>
        {actionsLoading ? (
          <div className="space-y-2"><BookCardSkeleton /><BookCardSkeleton /></div>
        ) : pendingTasks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-4 text-center">
              <p className="text-sm text-muted-foreground">タスクはありません</p>
              <p className="text-xs text-muted-foreground mt-1">
                メモに行動アイデアを書くと自動追加されます
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {pendingTasks.map((item: ActionItem) => (
              <ActionItemCard key={item.id} item={item} onToggle={toggleComplete} />
            ))}
          </div>
        )}
      </section>

      {/* Currently reading (collapsible) */}
      <section>
        <button
          onClick={() => setReadingOpen(v => !v)}
          className="w-full flex items-center justify-between mb-2"
        >
          <div className="flex items-center gap-1.5">
            <BookOpen size={14} className="text-muted-foreground" />
            <h2 className="font-semibold text-sm text-foreground">読書中の本</h2>
            <span className="text-xs text-muted-foreground">({reading.length}冊)</span>
          </div>
          {readingOpen
            ? <ChevronUp size={16} className="text-muted-foreground" />
            : <ChevronDown size={16} className="text-muted-foreground" />
          }
        </button>
        {readingOpen && (
          reading.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-xl p-5 text-center">
              <p className="text-sm text-muted-foreground mb-3">読書中の本がありません</p>
              <Link href="/books/new">
                <Button size="sm" variant="outline">本を追加する</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {reading.map((book: BookWithNoteCount) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )
        )}
      </section>

      {books.length === 0 && (
        <EmptyState
          title="最初の本を追加しましょう"
          description="読んでいる本・読みたい本を記録してAIで学びを最大化しましょう"
          action={
            <Link href="/books/new">
              <Button>本を追加する</Button>
            </Link>
          }
        />
      )}
    </div>
  )
}
