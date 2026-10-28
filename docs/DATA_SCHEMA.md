# AZZAB MOTO — Data Schema

> Zod is the single source of truth. TypeScript types are inferred from schemas.  
> Schemas live in `src/services/schemas/`. Repository interfaces live in `src/services/interfaces/`.

---

## Product Schema (`src/services/schemas/product.ts`)

```ts
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
  images: z
    .array(z.string().min(1))
    .min(1, 'At least one product image is required')
    .max(10, 'Maximum 10 images allowed per product'),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters'),
  compatibility: z.array(CompatibilitySchema).default([]),
})

export const ProductsArraySchema = z.array(ProductSchema)

export type Product = z.infer<typeof ProductSchema>
```

### Availability Statuses

| Value          | Arabic label | Color               | Notes                        |
| -------------- | ------------ | ------------------- | ---------------------------- |
| `in_stock`     | متوفر        | `#3E8E5E` (success) | Ready for immediate dispatch |
| `out_of_stock` | غير متوفر    | `#6B6560` (muted)   | Temporarily unavailable      |
| `order_only`   | بالطلب فقط   | `#FF8200` (accent)  | Procured upon customer order |

---

## Category Schema (`src/services/schemas/category.ts`)

```ts
export const CategorySchema = z.object({
  id: z.string().min(1, 'Category ID is required'),
  slug: z
    .string()
    .min(1, 'Category slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case'),
  name: z.string().min(1, 'Arabic category name is required').max(100),
  icon: z.string().min(1, 'Lucide icon name is required'),
  description: z.string().max(500).optional(),
})

export const CategoriesArraySchema = z.array(CategorySchema)

export type Category = z.infer<typeof CategorySchema>
```

---

## Model Schema (`src/services/schemas/model.ts`)

```ts
export const ModelSchema = z.object({
  id: z.string().min(1, 'Model ID is required'),
  name: z.string().min(1, 'Model name is required').max(100),
  nameAr: z.string().optional(),
  years: z
    .array(z.number().int().min(1990).max(2035))
    .min(1, 'At least one model year must be specified'),
  imageUrl: z.string().optional(),
})

export const ModelsArraySchema = z.array(ModelSchema)

export type Model = z.infer<typeof ModelSchema>
```

---

## Storage Keys (`src/shared/lib/storage.ts`)

Managed exclusively via `src/shared/lib/storage.ts`.

| Key                    | Type                        | Purpose                                  | Sensitive? |
| ---------------------- | --------------------------- | ---------------------------------------- | ---------- |
| `am_page_visits_v1`    | `number`                    | Count distinct page views for PWA prompt | No         |
| `am_pwa_dismissed_v1`  | `boolean`                   | Permanent PWA install dismiss state      | No         |
| `am_last_search_v1`    | `string`                    | Last search query (for UX convenience)   | No         |
| `am_vehicle_filter_v1` | `{modelId,year,categoryId}` | Last vehicle selector filter state       | No         |

**No Personally Identifiable Information (PII) is ever written to localStorage.**

---

## Sample Data Files (`src/data/`)

> **Notice:** All sample data is placeholder data and must be verified and substituted by the client prior to production launch.

- `src/data/categories.json`: 8 categories (`brakes`, `filters`, `electrical`, `batteries`, `tires`, `oils`, `engine`, `accessories`).
- `src/data/models.json`: 8 TVS motorcycle models (`TVS HLX 150`, `TVS Apache RTR 160 4V`, `TVS Apache RTR 200 4V`, `TVS Apache RR 310`, `TVS Jupiter 110`, `TVS NTorq 125`, `TVS Star City Plus`, `TVS Raider 125`).
- `src/data/products.json`: 24 products with realistic Arabic titles, OEM part numbers, prices in EGP, and compatibility matrices.
