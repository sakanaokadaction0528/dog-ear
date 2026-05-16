import { z } from 'zod'

export const actionFormSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください').max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(['today', 'this_week', 'long_term', 'work', 'side_hustle', 'publish']),
  priority: z.enum(['high', 'medium', 'low']),
  due_date: z.string().optional(),
})

export type ActionFormValues = z.infer<typeof actionFormSchema>
