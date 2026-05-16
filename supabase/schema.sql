-- ============================================================
-- Dog Ear Database Schema
-- Supabase dashboard の SQL Editor に貼り付けて実行してください
-- ============================================================

-- ─────────────────────────────────────────────
-- updated_at を自動更新するトリガー関数
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────
-- 1. books テーブル
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.books (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title      TEXT        NOT NULL,
  author     TEXT        NOT NULL DEFAULT '',
  category   TEXT        NOT NULL DEFAULT '',
  purpose    TEXT,
  status     TEXT        NOT NULL DEFAULT 'unread'
             CHECK (status IN ('unread', 'reading', 'finished', 'review')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────
-- 2. reading_notes テーブル
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reading_notes (
  id                 UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id            UUID        REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  read_date          DATE        NOT NULL DEFAULT CURRENT_DATE,
  read_range         TEXT,
  quote              TEXT,
  memo               TEXT,
  insight            TEXT,
  personal_relevance TEXT,
  action_idea        TEXT,
  importance         SMALLINT    NOT NULL DEFAULT 3
                                 CHECK (importance BETWEEN 1 AND 5),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER reading_notes_updated_at
  BEFORE UPDATE ON public.reading_notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────
-- 3. ai_summaries テーブル
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_summaries (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id      UUID        REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  summary_type TEXT        NOT NULL DEFAULT 'full',
  content      JSONB       NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 4. action_items テーブル
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.action_items (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id     UUID        REFERENCES public.books(id) ON DELETE SET NULL,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       TEXT        NOT NULL,
  description TEXT,
  category    TEXT        NOT NULL DEFAULT 'this_week'
              CHECK (category IN ('today', 'this_week', 'long_term', 'work', 'side_hustle', 'publish')),
  priority    TEXT        NOT NULL DEFAULT 'medium'
              CHECK (priority IN ('high', 'medium', 'low')),
  due_date    DATE,
  completed   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- インデックス
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_books_user_id         ON public.books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_status          ON public.books(status);
CREATE INDEX IF NOT EXISTS idx_reading_notes_book    ON public.reading_notes(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_notes_date    ON public.reading_notes(read_date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_book     ON public.ai_summaries(book_id);
CREATE INDEX IF NOT EXISTS idx_action_items_user     ON public.action_items(user_id);
CREATE INDEX IF NOT EXISTS idx_action_items_book     ON public.action_items(book_id);
CREATE INDEX IF NOT EXISTS idx_action_items_category ON public.action_items(category);
CREATE INDEX IF NOT EXISTS idx_action_items_completed ON public.action_items(completed);
