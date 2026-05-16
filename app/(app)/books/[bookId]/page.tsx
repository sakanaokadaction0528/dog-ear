'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { useBook, useBooks } from '@/lib/hooks/useBooks'
import { useNotes } from '@/lib/hooks/useNotes'
import { useAISummary } from '@/lib/hooks/useAISummary'
import { NoteCard } from '@/components/notes/NoteCard'
import { AISummaryCard } from '@/components/ai/AISummaryCard'
import { GenerateSummaryButton } from '@/components/ai/GenerateSummaryButton'
import { BookStatusBadge } from '@/components/books/BookStatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { BookStatus } from '@/lib/types/app.types'

export default function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const { book, loading: bookLoading, refetch: refetchBook } = useBook(bookId)
  const { notes, loading: notesLoading, deleteNote } = useNotes(bookId)
  const { latestContent, generating, error, generateSummary, summaries } = useAISummary(bookId)
  const { deleteBook } = useBooks()
  const router = useRouter()

  async function handleDeleteNote(noteId: string) {
    if (!confirm('このメモを削除しますか？')) return
    try {
      await deleteNote(noteId)
      toast.success('メモを削除しました')
      refetchBook()
    } catch {
      toast.error('削除に失敗しました')
    }
  }

  async function handleDeleteBook() {
    if (!confirm('この本と関連するすべてのメモ・要約を削除しますか？')) return
    try {
      await deleteBook(bookId)
      toast.success('本を削除しました')
      router.push('/books')
    } catch {
      toast.error('削除に失敗しました')
    }
  }

  async function handleGenerate() {
    await generateSummary()
    if (!error) toast.success('AI要約を生成しました')
  }

  if (bookLoading) return <LoadingSpinner />
  if (!book) return <EmptyState title="本が見つかりません" />

  return (
    <div>
      <TopBar
        title={book.title}
        showBack
        rightAction={
          <Link href={`/books/${bookId}/edit`}>
            <Button variant="ghost" size="sm">編集</Button>
          </Link>
        }
      />

      <Tabs defaultValue="notes" className="flex-1">
        <TabsList className="w-full rounded-none border-b border-border bg-transparent h-auto px-4 justify-start gap-0">
          {[
            { value: 'notes', label: `メモ (${notes.length})` },
            { value: 'ai',    label: 'AI要約' },
            { value: 'info',  label: '本の情報' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary
                         data-[state=active]:bg-transparent data-[state=active]:shadow-none
                         text-muted-foreground data-[state=active]:text-primary
                         px-4 py-3 text-sm font-medium"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Notes Tab */}
        <TabsContent value="notes" className="mt-0 px-4 pt-4 space-y-3">
          <div className="flex justify-end">
            <Link href={`/books/${bookId}/notes/new`}>
              <Button size="sm">＋ メモを追加</Button>
            </Link>
          </div>

          {notesLoading ? (
            <LoadingSpinner />
          ) : notes.length === 0 ? (
            <EmptyState
             
              title="まだメモがありません"
              description="読んだ内容や気づきを記録しましょう"
              action={
                <Link href={`/books/${bookId}/notes/new`}>
                  <Button>最初のメモを追加</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3 pb-4">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  bookId={bookId}
                  onDelete={handleDeleteNote}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* AI Tab */}
        <TabsContent value="ai" className="mt-0 px-4 pt-4 space-y-4 pb-4">
          <GenerateSummaryButton
            onGenerate={handleGenerate}
            generating={generating}
            error={error}
            hasNotes={notes.length > 0}
          />

          {latestContent ? (
            <AISummaryCard
              content={latestContent}
              generatedAt={summaries[0]?.created_at}
            />
          ) : (
            !generating && (
              <EmptyState
               
                title="AI要約がまだありません"
                description="上のボタンからAI要約を生成してください"
              />
            )
          )}
        </TabsContent>

        {/* Book Info Tab */}
        <TabsContent value="info" className="mt-0 px-4 pt-4 pb-4 space-y-5">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">タイトル</p>
              <p className="font-semibold text-foreground">{book.title}</p>
            </div>
            {book.author && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">著者</p>
                <p className="text-sm">{book.author}</p>
              </div>
            )}
            {book.category && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">カテゴリ</p>
                <p className="text-sm">{book.category}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-1">ステータス</p>
              <BookStatusBadge status={book.status as BookStatus} />
            </div>
            {book.purpose && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">読書目的</p>
                <p className="text-sm leading-relaxed">{book.purpose}</p>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive w-full"
            onClick={handleDeleteBook}
          >
            この本を削除する
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
