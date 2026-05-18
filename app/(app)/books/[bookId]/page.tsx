'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Share2, Sparkles, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useBook, useBooks } from '@/lib/hooks/useBooks'
import { useNotes } from '@/lib/hooks/useNotes'
import { useAISummary } from '@/lib/hooks/useAISummary'
import { usePosts } from '@/lib/hooks/usePosts'
import { NoteCard } from '@/components/notes/NoteCard'
import { AISummaryCard } from '@/components/ai/AISummaryCard'
import { GenerateSummaryButton } from '@/components/ai/GenerateSummaryButton'
import { BookStatusBadge } from '@/components/books/BookStatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PostForm } from '@/components/posts/PostForm'
import { BookCoverPicker } from '@/components/books/BookCoverPicker'
import type { BookStatus } from '@/lib/types/app.types'

export default function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const { book, loading: bookLoading, refetch: refetchBook } = useBook(bookId)
  const { notes, loading: notesLoading, deleteNote } = useNotes(bookId)
  const { latestContent, generating, error, generateSummary, summaries } = useAISummary(bookId)
  const { deleteBook, updateBook } = useBooks()
  const { createPost } = usePosts()
  const router = useRouter()
  const [showPostForm, setShowPostForm] = useState(false)
  const [activeTab, setActiveTab] = useState('notes')

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

  async function handlePost(values: { comment: string; image_url: string | null }) {
    if (!book) return
    await createPost({
      book_id: bookId,
      book_title: book.title,
      book_author: book.author,
      comment: values.comment,
      image_url: values.image_url,
    })
    setShowPostForm(false)
    toast.success('投稿しました！')
    router.push('/feed')
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

      {book.cover_url && (
        <div className="flex justify-center items-end px-4 pt-5 pb-3 bg-gradient-to-b from-muted/40 to-transparent">
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-28 h-40 object-cover rounded-xl shadow-lg border border-border/50"
          />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
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
          {/* AI nudge banner */}
          {!notesLoading && notes.length >= 3 && !latestContent && !generating && (
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/8 border border-primary/20 text-left hover:bg-primary/12 transition-colors"
            >
              <Sparkles size={16} className="text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium text-primary">AI要約を生成しよう</p>
                <p className="text-xs text-muted-foreground">メモが{notes.length}件たまりました。AIがまとめてくれます。</p>
              </div>
            </button>
          )}

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
            <div className="space-y-3 pb-24">
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
          {/* Post form or button */}
          {showPostForm ? (
            <div className="bg-card border border-border rounded-xl p-4">
              <PostForm
                bookTitle={book.title}
                bookAuthor={book.author}
                onSubmit={handlePost}
                onCancel={() => setShowPostForm(false)}
              />
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setShowPostForm(true)}
            >
              <Share2 size={15} />
              おすすめを投稿する
            </Button>
          )}

          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <BookCoverPicker
              bookTitle={book.title}
              bookAuthor={book.author}
              coverUrl={book.cover_url}
              onSelect={async (url) => {
                await updateBook(bookId, { cover_url: url })
                await refetchBook()
              }}
            />
            <div className="border-t border-border pt-4" />
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

          {/* Danger zone */}
          <div className="border border-destructive/30 rounded-xl p-4 space-y-3">
            <p className="text-xs font-medium text-destructive">危険な操作</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">この本を削除する</p>
                <p className="text-xs text-muted-foreground">メモ・要約もすべて削除されます</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5 shrink-0"
                onClick={handleDeleteBook}
              >
                <Trash2 size={13} />
                削除
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* FAB — メモ追加（ノートタブ表示中のみ） */}
      {activeTab === 'notes' && (
        <Link href={`/books/${bookId}/notes/new`}>
          <button
            type="button"
            className="fixed bottom-20 right-4 md:bottom-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={24} />
          </button>
        </Link>
      )}
    </div>
  )
}
