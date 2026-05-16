import { z } from 'zod'

export const noteFormSchema = z.object({
  read_date: z.string().min(1, '読んだ日を入力してください'),
  read_range: z.string().max(100).optional(),
  quote: z.string().max(1000).optional(),
  memo: z.string().max(2000).optional(),
  insight: z.string().max(1000).optional(),
  personal_relevance: z.string().max(1000).optional(),
  action_idea: z.string().max(500).optional(),
  importance: z.number().int().min(1).max(5),
})

export type NoteFormValues = z.infer<typeof noteFormSchema>
