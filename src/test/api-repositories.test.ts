import { describe, it, expect, beforeEach } from 'vitest'
import { ApiClient } from '@/services/api/client'
import { ApiProductRepository } from '@/services/api/api-product-repository'
import { ApiCategoryRepository } from '@/services/api/api-category-repository'
import { ApiVehicleRepository } from '@/services/api/api-vehicle-repository'
import { ApiOrderRepository } from '@/services/api/api-order-repository'

describe('API Repositories (MSW backed)', () => {
  let client: ApiClient
  let productRepo: ApiProductRepository
  let categoryRepo: ApiCategoryRepository
  let vehicleRepo: ApiVehicleRepository
  let orderRepo: ApiOrderRepository

  beforeEach(() => {
    client = new ApiClient('')
    productRepo = new ApiProductRepository(client)
    categoryRepo = new ApiCategoryRepository(client)
    vehicleRepo = new ApiVehicleRepository(client)
    orderRepo = new ApiOrderRepository(client)
  })

  describe('ApiProductRepository', () => {
    it('retrieves all products and maps wire string price to number', async () => {
      const products = await productRepo.getAll()
      expect(products.length).toBeGreaterThan(0)
      const first = products[0]
      expect(typeof first.price).toBe('number')
      expect(first.price).toBeGreaterThan(0)
      expect(first.currency).toBe('EGP')
    })

    it('retrieves product by slug', async () => {
      const product = await productRepo.getBySlug('front-brake-pads-apache-160-200')
      expect(product).not.toBeNull()
      expect(product?.slug).toBe('front-brake-pads-apache-160-200')
    })

    it('returns null for non-existent slug', async () => {
      const product = await productRepo.getBySlug('definitely-does-not-exist')
      expect(product).toBeNull()
    })

    it('filters products by category', async () => {
      const products = await productRepo.getByCategory('cat-brakes')
      expect(products.length).toBeGreaterThan(0)
      expect(products.every((p) => p.categoryId === 'cat-brakes')).toBe(true)
    })
  })

  describe('ApiCategoryRepository', () => {
    it('retrieves categories list', async () => {
      const categories = await categoryRepo.getAll()
      expect(categories.length).toBeGreaterThan(0)
      expect(categories.some((c) => c.slug === 'brakes')).toBe(true)
    })

    it('retrieves category by slug', async () => {
      const cat = await categoryRepo.getBySlug('brakes')
      expect(cat).not.toBeNull()
      expect(cat?.name).toBe('فرامل')
    })
  })

  describe('ApiVehicleRepository', () => {
    it('retrieves TVS models', async () => {
      const models = await vehicleRepo.getAll()
      expect(models.length).toBeGreaterThan(0)
      expect(models.some((m) => m.id === 'model-apache-160-4v')).toBe(true)
    })
  })

  describe('ApiOrderRepository', () => {
    it('creates an order successfully with COD and returns confirmation', async () => {
      const confirmation = await orderRepo.createOrder(
        {
          customer: {
            name: 'أحمد محمود',
            phone: '01012345678',
            governorate: 'القاهرة',
            city: 'مدينة نصر',
            address: 'شارع النصر، عمارة 10',
          },
          items: [
            {
              productId: 'prod-001',
              quantity: 2,
            },
          ],
        },
        'uuid-idempotency-test-1',
      )

      expect(confirmation.orderNumber).toMatch(/^AZ-\d{6}-\d{4}$/)
      expect(confirmation.status).toBe('new')
      expect(confirmation.items.length).toBe(1)
      expect(confirmation.customer.name).toBe('أحمد محمود')
      expect(confirmation.total).toBeDefined()
    })

    it('looks up existing order by orderNumber and phone', async () => {
      const result = await orderRepo.lookupOrder('AZ-202610-1001', '01012345678')
      expect(result.orderNumber).toBe('AZ-202610-1001')
      expect(result.status).toBe('new')
      expect(result.governorate).toBe('القاهرة')
    })

    it('fails order lookup with generic error when phone does not match', async () => {
      await expect(orderRepo.lookupOrder('AZ-202610-1001', '01099999999')).rejects.toThrow()
    })
  })
})
