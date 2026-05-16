-- ============================================================
-- Row Level Security (RLS) ポリシー
-- schema.sql の後に実行してください
-- ============================================================

-- RLS を有効化
ALTER TABLE public.books         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_summaries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items  ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- books: 自分のデータのみアクセス可
-- ─────────────────────────────────────────────
CREATE POLICY "books_select_own" ON public.books
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "books_insert_own" ON public.books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "books_update_own" ON public.books
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "books_delete_own" ON public.books
  FOR DELETE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- reading_notes: 本の所有者経由でアクセス制御
-- ─────────────────────────────────────────────
CREATE POLICY "notes_select_own" ON public.reading_notes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.books WHERE id = book_id AND user_id = auth.uid())
  );

CREATE POLICY "notes_insert_own" ON public.reading_notes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.books WHERE id = book_id AND user_id = auth.uid())
  );

CREATE POLICY "notes_update_own" ON public.reading_notes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.books WHERE id = book_id AND user_id = auth.uid())
  );

CREATE POLICY "notes_delete_own" ON public.reading_notes
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.books WHERE id = book_id AND user_id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- ai_summaries: 本の所有者経由でアクセス制御
-- ─────────────────────────────────────────────
CREATE POLICY "summaries_select_own" ON public.ai_summaries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.books WHERE id = book_id AND user_id = auth.uid())
  );

CREATE POLICY "summaries_insert_own" ON public.ai_summaries
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.books WHERE id = book_id AND user_id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- action_items: 自分のデータのみアクセス可
-- ─────────────────────────────────────────────
CREATE POLICY "actions_select_own" ON public.action_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "actions_insert_own" ON public.action_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "actions_update_own" ON public.action_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "actions_delete_own" ON public.action_items
  FOR DELETE USING (auth.uid() = user_id);
