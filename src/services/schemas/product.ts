import { z } from 'zod'

export const CompatibilitySchema = z
  .object({
    modelId: z.string().min(1, 'Model ID is required'),
    yearFrom: z.number().int().min(1990).max(2035),
    yearTo: z.number().int().min(1990).max(2035),
  })
  .refine((data) => data.yearTo >= data.yearFrom, {
    message: 'yearTo must be greater than or equal to yearFrom',
    path: ['yearTo'],
  })

export type Compatibility = z.infer<typeof CompatibilitySchema>

export const ProductAvailabilitySchema = z.enum(['in_stock', 'out_of_stock', 'order_only'])

export type ProductAvailability = z.infer<typeof ProductAvailabilitySchema>

export const ProductSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
  slug: z
    .string()
    .min(1, 'Product slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case (lowercase alphanumeric and hyphens)'),
  name: z.string().min(1, 'Arabic product name is required').max(200),
  nameEn: z.string().min(1, 'English product name is required').max(200),
  sku: z
    .string()
    .min(1, 'SKU is required')
    .regex(/^[A-Z0-9-]+$/i, 'SKU must contain only letters, numbers, and hyphens'),
  partNumber: z.string().max(50).optional().default(''),
  categoryId: z.string().min(1, 'Category ID is required'),
  price: z.number().positive('Price must be greater than 0'),
  currency: z.literal('EGP').default('EGP'),
  availability: ProductAvailabilitySchema,
  stockQuantity: z.number().int().nonnegative().nullable().optional(),
  images: z
    .array(z.string().min(1))
    .min(1, 'At least one product image is required')
    .max(10, 'Maximum 10 images allowed per product'),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters'),
  compatibility: z.array(CompatibilitySchema).default([]),
})

export const ProductsArraySchema = z.array(ProductSchema)

export type Product = z.infer<typeof ProductSchema>
