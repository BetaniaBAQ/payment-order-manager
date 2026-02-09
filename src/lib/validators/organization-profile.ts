import { z } from 'zod'

// URL search param schema for TanStack Router validation
export const filterSearchSchema = z.object({
  q: z.string().optional(),
  status: z.string().optional(),
  tag: z.string().optional(),
  from: z.coerce.number().optional(),
  to: z.coerce.number().optional(),
  creator: z.string().optional(),
})

export type FilterSearchParams = z.infer<typeof filterSearchSchema>
