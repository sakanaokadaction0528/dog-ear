import { z } from 'zod'

// Use z.infer on the output type (with defaults resolved) for React Hook Form
export const bookFormSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください').max(200),
  author: z.string().max(100),
  category: z.string().max(50),
  purpose: z.string().max(500).optional(),
  status: z.enum(['unread', 'reading', 'finished', 'review']),
  cover_url: z.string().url().nullable().optional(),
})

export type BookFormValues = z.infer<typeof bookFormSchema>
