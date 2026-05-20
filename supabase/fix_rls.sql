-- ============================================================
-- RLS の確認・修正スクリプト
-- Supabase Dashboard > SQL Editor で実行してください
-- ============================================================

-- 1. RLS が有効かどうか確認
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'books';
-- rowsecurity が false なら RLS が無効 → 下の ALTER TABLE で有効化

-- 2. 既存のポリシーを確認
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'books';

-- 3. RLS を確実に有効化（既に有効でも安全に実行可）
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- 4. 既存ポリシーを一度削除して再作成（重複エラー防止）
DROP POLICY IF EXISTS "books_select_own" ON public.books;
DROP POLICY IF EXISTS "books_insert_own" ON public.books;
DROP POLICY IF EXISTS "books_update_own" ON public.books;
DROP POLICY IF EXISTS "books_delete_own" ON public.books;

-- 5. 正しいポリシーを再作成
CREATE POLICY "books_select_own" ON public.books
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "books_insert_own" ON public.books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "books_update_own" ON public.books
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "books_delete_own" ON public.books
  FOR DELETE USING (auth.uid() = user_id);

-- 6. 動作確認：これを実行して自分の本だけ返ってくれば成功
-- SELECT id, user_id, title FROM public.books LIMIT 10;
