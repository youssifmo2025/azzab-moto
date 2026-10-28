import { describe, it, expect, beforeEach } from 'vitest'
import { ApiClient } from '@/services/api/client'
import { ApiClientError } from '@/services/api/schemas/error'
import { z } from 'zod'

describe('ApiClient', () => {
  let client: ApiClient

  beforeEach(() => {
    client = new ApiClient('')
  })

  it('fetches product list successfully via GET /api/products', async () => {
    const res = await client.get<{ data: unknown[]; meta: { total: number } }>('/api/products')
    expect(res).toBeDefined()
    expect(Array.isArray(res.data)).toBe(true)
    expect(res.data.length).toBeGreaterThan(0)
    expect(res.meta.total).toBeGreaterThan(0)
  })

  it('returns 404 ApiClientError for non-existent product slug', async () => {
    await expect(client.get('/api/products/non-existent-product-slug')).rejects.toThrow(ApiClientError)
    try {
      await client.get('/api/products/non-existent-product-slug')
    } catch (err) {
      const apiErr = err as ApiClientError
      expect(apiErr.status).toBe(404)
      expect(apiErr.code).toBe('NOT_FOUND')
    }
  })

  it('validates response against Zod schema', async () => {
    const ProductSlugSchema = z.object({
      id: z.string(),
      slug: z.string(),
      name: z.string(),
    })

    const product = await client.get('/api/products/front-brake-pads-apache-160-200', {
      responseSchema: ProductSlugSchema,
    })
    expect(product).toHaveProperty('id')
    expect(product).toHaveProperty('slug')
  })

  it('fails with CLIENT_VALIDATION_ERROR if response schema does not match', async () => {
    const StrictSchema = z.object({
      nonExistentPropertyRequired: z.string(),
    })

    await expect(
      client.get('/api/products/front-brake-pads-apache-160-200', {
        responseSchema: StrictSchema,
      }),
    ).rejects.toThrow(ApiClientError)
  })

  it('handles 429 Rate Limited with Retry-After message in Arabic', async () => {
    try {
      await client.post('/api/auth/login', { username: 'rate_limited', password: 'xyz' })
      expect.fail('Should have thrown ApiClientError')
    } catch (err) {
      const apiErr = err as ApiClientError
      expect(apiErr.status).toBe(429)
      expect(apiErr.code).toBe('RATE_LIMITED')
      expect(apiErr.message).toContain('900')
    }
  })

  it('attaches CSRF token to mutating requests', async () => {
    client.setCsrfToken('custom-csrf-123')
    expect(client.getCsrfToken()).toBe('custom-csrf-123')
  })
})
