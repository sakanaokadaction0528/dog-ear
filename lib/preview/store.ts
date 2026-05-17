/**
 * localStorage-backed store for PREVIEW_MODE=1.
 * Survives full page reloads. Sufficient for demo/preview use.
 */

import type { BookWithNoteCount, ReadingNote, ActionItem, Post, Want, AISummaryRow, BookStatus, ActionCategory, Priority } from '@/lib/types/app.types'

function uuid(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota errors
  }
}

// ---- Books ----

const BOOKS_KEY = 'dog-ear-preview-books'

function getBooks(): BookWithNoteCount[] {
  return load<BookWithNoteCount[]>(BOOKS_KEY, [])
}

function saveBooks(books: BookWithNoteCount[]) {
  save(BOOKS_KEY, books)
}

type BookCreateInput = {
  title: string
  author: string
  category: string
  purpose: string | null
  status: BookStatus
}

export const previewBooks = {
  getAll: () =>
    [...getBooks()].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    ),
  getById: (id: string) => getBooks().find((b) => b.id === id) ?? null,
  create: (values: BookCreateInput): BookWithNoteCount => {
    const book: BookWithNoteCount = {
      id: uuid(),
      user_id: 'preview',
      created_at: now(),
      updated_at: now(),
      note_count: 0,
      title: values.title,
      author: values.author,
      category: values.category,
      purpose: values.purpose,
      status: values.status as BookStatus,
    }
    saveBooks([book, ...getBooks()])
    return book
  },
  update: (id: string, values: Partial<BookWithNoteCount>) => {
    saveBooks(getBooks().map((b) => (b.id === id ? { ...b, ...values, updated_at: now() } : b)))
  },
  delete: (id: string) => {
    saveBooks(getBooks().filter((b) => b.id !== id))
    previewNotes.deleteByBook(id)
    previewActions.deleteByBook(id)
  },
  incrementNoteCount: (bookId: string, delta: number) => {
    saveBooks(
      getBooks().map((b) =>
        b.id === bookId
          ? { ...b, note_count: Math.max(0, b.note_count + delta), updated_at: now() }
          : b
      )
    )
  },
}

// ---- Notes ----

const NOTES_KEY = 'dog-ear-preview-notes'

function getNotes(): ReadingNote[] {
  return load<ReadingNote[]>(NOTES_KEY, [])
}

function saveNotes(notes: ReadingNote[]) {
  save(NOTES_KEY, notes)
}

type NoteCreateInput = {
  read_date: string
  read_range: string | null
  quote: string | null
  memo: string | null
  insight: string | null
  personal_relevance: string | null
  action_idea: string | null
  importance: number
}

export const previewNotes = {
  getByBook: (bookId: string) =>
    [...getNotes()]
      .filter((n) => n.book_id === bookId)
      .sort((a, b) => new Date(b.read_date).getTime() - new Date(a.read_date).getTime()),
  create: (bookId: string, values: NoteCreateInput): ReadingNote => {
    const note: ReadingNote = {
      id: uuid(),
      book_id: bookId,
      created_at: now(),
      updated_at: now(),
      read_date: values.read_date,
      read_range: values.read_range,
      quote: values.quote,
      memo: values.memo,
      insight: values.insight,
      personal_relevance: values.personal_relevance,
      action_idea: values.action_idea,
      importance: values.importance,
    }
    saveNotes([note, ...getNotes()])
    previewBooks.incrementNoteCount(bookId, 1)
    return note
  },
  update: (id: string, values: Partial<ReadingNote>) => {
    saveNotes(getNotes().map((n) => (n.id === id ? { ...n, ...values, updated_at: now() } : n)))
  },
  delete: (id: string) => {
    const note = getNotes().find((n) => n.id === id)
    if (note) previewBooks.incrementNoteCount(note.book_id, -1)
    saveNotes(getNotes().filter((n) => n.id !== id))
  },
  deleteByBook: (bookId: string) => {
    saveNotes(getNotes().filter((n) => n.book_id !== bookId))
  },
}

// ---- Action Items ----

const ACTIONS_KEY = 'dog-ear-preview-actions'

function getActions(): ActionItem[] {
  return load<ActionItem[]>(ACTIONS_KEY, [])
}

function saveActions(actions: ActionItem[]) {
  save(ACTIONS_KEY, actions)
}

type ActionCreateInput = {
  title: string
  description: string | null
  category: ActionCategory
  priority: Priority
  due_date: string | null
  completed: boolean
  book_id: string | null
}

export const previewActions = {
  getAll: () =>
    [...getActions()].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
  getByBook: (bookId: string) => getActions().filter((a) => a.book_id === bookId),
  create: (values: ActionCreateInput): ActionItem => {
    const item: ActionItem = {
      id: uuid(),
      user_id: 'preview',
      created_at: now(),
      title: values.title,
      description: values.description,
      category: values.category,
      priority: values.priority,
      due_date: values.due_date,
      completed: values.completed,
      book_id: values.book_id,
    }
    saveActions([item, ...getActions()])
    return item
  },
  toggle: (id: string, completed: boolean) => {
    saveActions(getActions().map((a) => (a.id === id ? { ...a, completed } : a)))
  },
  delete: (id: string) => {
    saveActions(getActions().filter((a) => a.id !== id))
  },
  deleteByBook: (bookId: string) => {
    saveActions(getActions().filter((a) => a.book_id !== bookId))
  },
}

// ---- Posts ----

const POSTS_KEY = 'dog-ear-preview-posts'
const WANTS_KEY = 'dog-ear-preview-wants'

function getPosts(): Post[] {
  return load<Post[]>(POSTS_KEY, [])
}
function savePosts(posts: Post[]) {
  save(POSTS_KEY, posts)
}
function getWants(): Want[] {
  return load<Want[]>(WANTS_KEY, [])
}
function saveWants(wants: Want[]) {
  save(WANTS_KEY, wants)
}

type PostCreateInput = {
  book_id: string | null
  book_title: string
  book_author: string
  comment: string
  image_url: string | null
}

export const previewPosts = {
  getAll: () =>
    [...getPosts()].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
  create: (values: PostCreateInput): Post => {
    const post: Post = {
      id: uuid(),
      user_id: 'preview',
      created_at: now(),
      want_count: 0,
      ...values,
    }
    savePosts([post, ...getPosts()])
    return post
  },
  delete: (id: string) => {
    savePosts(getPosts().filter((p) => p.id !== id))
    saveWants(getWants().filter((w) => w.post_id !== id))
  },
  incrementWant: (postId: string, delta: number) => {
    savePosts(
      getPosts().map((p) =>
        p.id === postId ? { ...p, want_count: Math.max(0, p.want_count + delta) } : p
      )
    )
  },
}

// ---- AI Summaries ----

const SUMMARIES_KEY = 'dog-ear-preview-summaries'

function getSummaries(): AISummaryRow[] {
  return load<AISummaryRow[]>(SUMMARIES_KEY, [])
}
function saveSummaries(rows: AISummaryRow[]) {
  save(SUMMARIES_KEY, rows)
}

export const previewSummaries = {
  getByBook: (bookId: string) =>
    [...getSummaries()]
      .filter((s) => s.book_id === bookId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  create: (bookId: string, content: unknown): AISummaryRow => {
    const row: AISummaryRow = {
      id: uuid(),
      book_id: bookId,
      summary_type: 'full',
      content: content as AISummaryRow['content'],
      created_at: now(),
    }
    saveSummaries([row, ...getSummaries()])
    return row
  },
}

export const previewWants = {
  getByUser: (userId: string) => getWants().filter((w) => w.user_id === userId),
  hasWanted: (postId: string, userId: string) =>
    getWants().some((w) => w.post_id === postId && w.user_id === userId),
  toggle: (postId: string, userId: string): boolean => {
    const existing = getWants().find((w) => w.post_id === postId && w.user_id === userId)
    if (existing) {
      saveWants(getWants().filter((w) => w.id !== existing.id))
      previewPosts.incrementWant(postId, -1)
      return false
    } else {
      const want: Want = { id: uuid(), post_id: postId, user_id: userId, created_at: now() }
      saveWants([want, ...getWants()])
      previewPosts.incrementWant(postId, 1)
      return true
    }
  },
}
