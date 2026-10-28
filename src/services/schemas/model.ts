import { z } from 'zod'

export const ModelSchema = z.object({
  id: z.string().min(1, 'Model ID is required'),
  name: z.string().min(1, 'Model name is required').max(100),
  years: z
    .array(z.number().int().min(1990).max(2035))
    .min(1, 'At least one model year must be specified'),
  imageUrl: z.string().optional(),
  nameAr: z.string().optional(),
})

export const ModelsArraySchema = z.array(ModelSchema)

export type Model = z.infer<typeof ModelSchema>
