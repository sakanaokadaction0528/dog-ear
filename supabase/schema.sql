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
-- 5. posts テーブル（SNS投稿）
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.posts (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id     UUID        REFERENCES public.books(id) ON DELETE SET NULL,
  book_title  TEXT        NOT NULL,
  book_author TEXT        NOT NULL DEFAULT '',
  comment     TEXT        NOT NULL DEFAULT '',
  image_url   TEXT,
  want_count  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 6. wants テーブル（読みたい！リアクション）
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wants (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id    UUID        REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

-- want_count を wants の INSERT/DELETE で自動同期するトリガー
CREATE OR REPLACE FUNCTION public.handle_want_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET want_count = want_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET want_count = GREATEST(want_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wants_sync_count
  AFTER INSERT OR DELETE ON public.wants
  FOR EACH ROW EXECUTE FUNCTION public.handle_want_count();

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
CREATE INDEX IF NOT EXISTS idx_posts_user_id         ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at      ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wants_post_id         ON public.wants(post_id);
CREATE INDEX IF NOT EXISTS idx_wants_user_id         ON public.wants(user_id);
