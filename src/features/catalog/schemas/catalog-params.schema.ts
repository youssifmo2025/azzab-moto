import { z } from 'zod'
import { sanitizeSearch } from '@/shared/utils/sanitizeSearch'

export const CatalogSortEnum = z.enum(['name_asc', 'name_desc', 'price_asc', 'price_desc'])

export type CatalogSort = z.infer<typeof CatalogSortEnum>

export const CatalogQueryParamsSchema = z.object({
  modelId: z.string().trim().min(1).optional(),
  year: z.coerce.number().int().min(1990).max(2035).optional(),
  categoryId: z.string().trim().min(1).optional(),
  q: z
    .string()
    .transform((val) => sanitizeSearch(val))
    .optional(),
  sort: CatalogSortEnum.catch('name_asc'),
  page: z.coerce.number().int().positive().catch(1),
})

export type CatalogQueryParams = z.infer<typeof CatalogQueryParamsSchema>

/**
 * Safely parses URL search params or an object of strings into valid CatalogQueryParams.
 * Never throws — corrupted or invalid values gracefully fall back to safe defaults.
 */
export function parseCatalogQueryParams(
  params: URLSearchParams | Record<string, string | undefined>,
): CatalogQueryParams {
  const raw: Record<string, unknown> = {}

  if (params instanceof URLSearchParams) {
    for (const [key, value] of params.entries()) {
      if (value !== '') {
        raw[key] = value
      }
    }
  } else {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        raw[key] = value
      }
    }
  }

  const result = CatalogQueryParamsSchema.safeParse(raw)
  if (result.success) {
    return result.data
  }

  // Safe fallback
  return {
    sort: 'name_asc',
    page: 1,
  }
}
