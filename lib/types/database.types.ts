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
          cover_url: string | null
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
          cover_url?: string | null
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
          cover_url?: string | null
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
      posts: {
        Row: {
          id: string
          user_id: string
          book_id: string | null
          book_title: string
          book_author: string
          comment: string
          image_url: string | null
          want_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id?: string | null
          book_title: string
          book_author?: string
          comment?: string
          image_url?: string | null
          want_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string | null
          book_title?: string
          book_author?: string
          comment?: string
          image_url?: string | null
          want_count?: number
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          nickname: string | null
          avatar_url: string | null
          bio: string | null
          bookshelf_public: boolean
          updated_at: string | null
        }
        Insert: {
          id: string
          nickname?: string | null
          avatar_url?: string | null
          bio?: string | null
          bookshelf_public?: boolean
          updated_at?: string | null
        }
        Update: {
          id?: string
          nickname?: string | null
          avatar_url?: string | null
          bio?: string | null
          bookshelf_public?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      wants: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
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
