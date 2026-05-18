-- Add cover_url column to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_url TEXT;
