import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getLLMProvider } from '@/lib/ai'
import type { AISummaryContent, Book, ReadingNote } from '@/lib/types/app.types'

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let bookId: string
  try {
    const body = await request.json()
    bookId = body.bookId
    if (!bookId) throw new Error('missing bookId')
  } catch {
    return NextResponse.json({ error: 'bookId is required' }, { status: 400 })
  }

  // Verify the book belongs to this user
  const { data: bookData, error: bookError } = await supabase
    .from('books')
    .select('*')
    .eq('id', bookId)
    .eq('user_id', user.id)
    .single()

  if (bookError || !bookData) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }
  const book = bookData as Book

  // Fetch all reading notes for this book
  const { data: notesData } = await supabase
    .from('reading_notes')
    .select('*')
    .eq('book_id', bookId)
    .order('read_date', { ascending: true })

  const notes = (notesData ?? []) as ReadingNote[]

  if (notes.length === 0) {
    return NextResponse.json({ error: '読書メモがありません。先にメモを追加してください。' }, { status: 400 })
  }

  // Generate AI summary
  const llm = getLLMProvider()
  let content: AISummaryContent
  try {
    content = await llm.generateBookSummary(book.title, book.author, book.purpose, notes)
  } catch (e) {
    console.error('AI generation error:', e)
    return NextResponse.json({ error: 'AI要約の生成に失敗しました' }, { status: 500 })
  }

  // Persist the summary
  const { data: summary, error: insertErr } = await supabase
    .from('ai_summaries')
    .insert({ book_id: bookId, summary_type: 'full', content: content as unknown as import('@/lib/types/database.types').Json })
    .select()
    .single()

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  // Also persist AI-generated action items (cast to bypass strict generic inference)
  if (content.action_items && content.action_items.length > 0) {
    const actionRows = content.action_items.map((item) => ({
      book_id: bookId,
      user_id: user.id,
      title: item.title,
      description: item.description,
      category: item.category,
      priority: item.priority,
      due_date: item.due_date || null,
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from('action_items').insert(actionRows as any)
  }

  return NextResponse.json({ summary })
}
