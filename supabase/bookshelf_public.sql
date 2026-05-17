-- Add bookshelf_public toggle to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bookshelf_public BOOLEAN NOT NULL DEFAULT false;

-- Allow authenticated users to read books when owner has made bookshelf public
CREATE POLICY "Authenticated users can view public bookshelves" ON books
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = books.user_id
      AND profiles.bookshelf_public = true
    )
  );
