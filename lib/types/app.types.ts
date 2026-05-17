import type { Database } from './database.types'

export type Book = Database['public']['Tables']['books']['Row']
export type BookInsert = Database['public']['Tables']['books']['Insert']
export type BookUpdate = Database['public']['Tables']['books']['Update']
export type ReadingNote = Database['public']['Tables']['reading_notes']['Row']
export type ReadingNoteInsert = Database['public']['Tables']['reading_notes']['Insert']
export type AISummaryRow = Database['public']['Tables']['ai_summaries']['Row']
export type ActionItem = Database['public']['Tables']['action_items']['Row']
export type ActionItemInsert = Database['public']['Tables']['action_items']['Insert']

export type BookStatus = 'unread' | 'reading' | 'finished' | 'review'
export type ActionCategory = 'today' | 'this_week' | 'long_term' | 'work' | 'side_hustle' | 'publish'
export type Priority = 'high' | 'medium' | 'low'

// Book with aggregated note count for list display
export type BookWithNoteCount = Book & { note_count: number }

// AI response JSON structure stored in ai_summaries.content
export interface AISummaryContent {
  summary: string
  key_lessons: string[]
  personal_insights: string[]
  action_items: Array<{
    title: string
    description: string
    category: ActionCategory
    priority: Priority
    due_date: string
  }>
  content_ideas?: {
    note: string[]
    youtube: string[]
  }
}

// SNS types
export type Post = {
  id: string
  user_id: string
  book_id: string | null
  book_title: string
  book_author: string
  comment: string
  image_url: string | null
  want_count: number
  created_at: string
  poster_nickname?: string | null
  poster_avatar_url?: string | null
}

export type Want = {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

// Label maps for display
export const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
  unread: '未読',
  reading: '読書中',
  finished: '読了',
  review: '要復習',
}

export const ACTION_CATEGORY_LABELS: Record<ActionCategory, string> = {
  today: '今日やる',
  this_week: '今週やる',
  long_term: '長期的に意識',
  work: '仕事に活かす',
  side_hustle: '副業に活かす',
  publish: '発信に活かす',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: '高',
  medium: '中',
  low: '低',
}
