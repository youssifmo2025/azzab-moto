import { z } from 'zod'

export const CategorySchema = z.object({
  id: z.string().min(1, 'Category ID is required'),
  slug: z
    .string()
    .min(1, 'Category slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case (lowercase alphanumeric and hyphens)'),
  name: z.string().min(1, 'Arabic category name is required').max(100),
  icon: z.string().min(1, 'Lucide icon name is required'),
  description: z.string().max(500).optional(),
})

export const CategoriesArraySchema = z.array(CategorySchema)

export type Category = z.infer<typeof CategorySchema>
