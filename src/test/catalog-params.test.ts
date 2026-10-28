import { describe, it, expect } from 'vitest'
import {
  parseCatalogQueryParams,
  CatalogQueryParamsSchema,
} from '@/features/catalog/schemas/catalog-params.schema'

describe('Catalog Query Params Parser', () => {
  it('parses valid search parameters from URLSearchParams', () => {
    const params = new URLSearchParams({
      modelId: 'model-hlx-150',
      year: '2022',
      categoryId: 'cat-brakes',
      q: 'تيل فرامل',
      sort: 'price_asc',
      page: '2',
    })

    const parsed = parseCatalogQueryParams(params)

    expect(parsed.modelId).toBe('model-hlx-150')
    expect(parsed.year).toBe(2022)
    expect(parsed.categoryId).toBe('cat-brakes')
    expect(parsed.q).toBe('تيل فرامل')
    expect(parsed.sort).toBe('price_asc')
    expect(parsed.page).toBe(2)
  })

  it('safely falls back to defaults on empty params', () => {
    const parsed = parseCatalogQueryParams(new URLSearchParams())

    expect(parsed.sort).toBe('name_asc')
    expect(parsed.page).toBe(1)
    expect(parsed.modelId).toBeUndefined()
    expect(parsed.year).toBeUndefined()
    expect(parsed.categoryId).toBeUndefined()
  })

  it('safely handles corrupted or invalid year values', () => {
    const invalidYear = new URLSearchParams({
      year: 'invalid-year-string',
    })
    const parsed = parseCatalogQueryParams(invalidYear)
    expect(parsed.year).toBeUndefined()

    const outOfBoundsYear = new URLSearchParams({
      year: '1920', // Below 1990 min
    })
    const parsedOutOfBounds = parseCatalogQueryParams(outOfBoundsYear)
    expect(parsedOutOfBounds.year).toBeUndefined()
  })

  it('falls back to default sort on unrecognized sort values', () => {
    const invalidSort = new URLSearchParams({
      sort: 'unsupported_sort_mode',
    })
    const parsed = parseCatalogQueryParams(invalidSort)
    expect(parsed.sort).toBe('name_asc')
  })

  it('sanitizes hostile search string in query params', () => {
    const hostile = new URLSearchParams({
      q: '<script>alert(1)</script>فلتر',
    })
    const parsed = parseCatalogQueryParams(hostile)
    expect(parsed.q).toBe('alert(1)فلتر')
    expect(parsed.q).not.toContain('<script>')
  })

  it('parses plain object representation as well', () => {
    const parsed = parseCatalogQueryParams({
      categoryId: 'cat-filters',
      sort: 'price_desc',
    })
    expect(parsed.categoryId).toBe('cat-filters')
    expect(parsed.sort).toBe('price_desc')
  })

  it('direct Zod schema parse safely catches invalid formats', () => {
    const result = CatalogQueryParamsSchema.safeParse({
      page: -5,
      sort: 'unknown',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.sort).toBe('name_asc')
    }
  })
})
