// Supabase database types
// Run: npx supabase gen types typescript --project-id <YOUR_PROJECT_ID> > lib/types/database.types.ts to regenerate
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      books: {
        Row: {
          id: string
          user_id: string
          title: string
          author: string
          category: string
          purpose: string | null
          status: 'unread' | 'reading' | 'finished' | 'review'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          author?: string
          category?: string
          purpose?: string | null
          status?: 'unread' | 'reading' | 'finished' | 'review'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          author?: string
          category?: string
          purpose?: string | null
          status?: 'unread' | 'reading' | 'finished' | 'review'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reading_notes: {
        Row: {
          id: string
          book_id: string
          read_date: string
          read_range: string | null
          quote: string | null
          memo: string | null
          insight: string | null
          personal_relevance: string | null
          action_idea: string | null
          importance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          book_id: string
          read_date?: string
          read_range?: string | null
          quote?: string | null
          memo?: string | null
          insight?: string | null
          personal_relevance?: string | null
          action_idea?: string | null
          importance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          book_id?: string
          read_date?: string
          read_range?: string | null
          quote?: string | null
          memo?: string | null
          insight?: string | null
          personal_relevance?: string | null
          action_idea?: string | null
          importance?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_summaries: {
        Row: {
          id: string
          book_id: string
          summary_type: string
          content: Json
          created_at: string
        }
        Insert: {
          id?: string
          book_id: string
          summary_type?: string
          content: Json
          created_at?: string
        }
        Update: {
          id?: string
          book_id?: string
          summary_type?: string
          content?: Json
          created_at?: string
        }
        Relationships: []
      }
      action_items: {
        Row: {
          id: string
          book_id: string | null
          user_id: string
          title: string
          description: string | null
          category: 'today' | 'this_week' | 'long_term' | 'work' | 'side_hustle' | 'publish'
          priority: 'high' | 'medium' | 'low'
          due_date: string | null
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          book_id?: string | null
          user_id: string
          title: string
          description?: string | null
          category?: 'today' | 'this_week' | 'long_term' | 'work' | 'side_hustle' | 'publish'
          priority?: 'high' | 'medium' | 'low'
          due_date?: string | null
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          book_id?: string | null
          user_id?: string
          title?: string
          description?: string | null
          category?: 'today' | 'this_week' | 'long_term' | 'work' | 'side_hustle' | 'publish'
          priority?: 'high' | 'medium' | 'low'
          due_date?: string | null
          completed?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
