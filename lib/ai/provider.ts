import type { AISummaryContent, ReadingNote } from '@/lib/types/app.types'

// LLM abstraction — implement this interface to add any provider
export interface LLMProvider {
  generateBookSummary(
    bookTitle: string,
    bookAuthor: string,
    bookPurpose: string | null,
    notes: ReadingNote[]
  ): Promise<AISummaryContent>
}
