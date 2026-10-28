import { describe, it, expect } from 'vitest'
import {
  JsonProductRepository,
  JsonCategoryRepository,
  JsonVehicleRepository,
} from '@/services/json'

describe('JSON Repositories and Sample Data Validation', () => {
  const productRepo = new JsonProductRepository()
  const categoryRepo = new JsonCategoryRepository()
  const vehicleRepo = new JsonVehicleRepository()

  describe('CategoryRepository', () => {
    it('loads and validates all 8 sample categories via Zod', async () => {
      const categories = await categoryRepo.getAll()
      expect(categories.length).toBe(8)
      expect(categories.map((c) => c.slug)).toEqual(
        expect.arrayContaining([
          'brakes',
          'filters',
          'electrical',
          'batteries',
          'tires',
          'oils',
          'engine',
          'accessories',
        ]),
      )
    })

    it('finds category by slug and id', async () => {
      const bySlug = await categoryRepo.getBySlug('brakes')
      expect(bySlug).not.toBeNull()
      expect(bySlug?.name).toBe('فرامل')

      const byId = await categoryRepo.getById('cat-brakes')
      expect(byId).toEqual(bySlug)

      const nonExistent = await categoryRepo.getBySlug('non-existent')
      expect(nonExistent).toBeNull()
    })
  })

  describe('VehicleRepository', () => {
    it('loads and validates all 8 TVS motorcycle models via Zod', async () => {
      const models = await vehicleRepo.getAll()
      expect(models.length).toBe(8)
      expect(models.map((m) => m.name)).toEqual(
        expect.arrayContaining([
          'TVS HLX 150',
          'TVS Apache RTR 160 4V',
          'TVS Apache RTR 200 4V',
          'TVS Apache RR 310',
          'TVS Jupiter 110',
          'TVS NTorq 125',
          'TVS Star City Plus',
          'TVS Raider 125',
        ]),
      )
    })

    it('finds model by id', async () => {
      const model = await vehicleRepo.getById('model-hlx-150')
      expect(model).not.toBeNull()
      expect(model?.name).toBe('TVS HLX 150')
      expect(model?.years).toContain(2022)
    })
  })

  describe('ProductRepository', () => {
    it('loads and validates all 24 sample products via Zod', async () => {
      const products = await productRepo.getAll()
      expect(products.length).toBe(24)
      for (const p of products) {
        expect(p.currency).toBe('EGP')
        expect(p.price).toBeGreaterThan(0)
        expect(p.images.length).toBeGreaterThanOrEqual(1)
      }
    })

    it('retrieves product by slug and id', async () => {
      const product = await productRepo.getBySlug('front-brake-pads-apache-160-200')
      expect(product).not.toBeNull()
      expect(product?.sku).toBe('AZB-BRK-001')

      const byId = await productRepo.getById('prod-001')
      expect(byId).toEqual(product)
    })

    it('filters products by categoryId', async () => {
      const brakes = await productRepo.getByCategory('cat-brakes')
      expect(brakes.length).toBe(3)
      for (const p of brakes) {
        expect(p.categoryId).toBe('cat-brakes')
      }
    })

    it('filters products by motorcycle model and year', async () => {
      const hlxProducts2022 = await productRepo.getByModel('model-hlx-150', 2022)
      expect(hlxProducts2022.length).toBeGreaterThan(0)

      for (const p of hlxProducts2022) {
        const matches = p.compatibility.some(
          (c) => c.modelId === 'model-hlx-150' && 2022 >= c.yearFrom && 2022 <= c.yearTo,
        )
        expect(matches).toBe(true)
      }
    })

    it('searches products by Arabic name or English name or SKU', async () => {
      const byArabic = await productRepo.search('فرامل')
      expect(byArabic.length).toBeGreaterThan(0)

      const bySku = await productRepo.search('AZB-BRK-001')
      expect(bySku.length).toBe(1)
      expect(bySku[0].id).toBe('prod-001')

      const byEnglish = await productRepo.search('spark plug')
      expect(byEnglish.length).toBe(1)

      const empty = await productRepo.search('')
      expect(empty).toEqual([])
    })

    it('returns best seller products up to requested limit', async () => {
      const bestSellers = await productRepo.getBestSellers(4)
      expect(bestSellers.length).toBe(4)
      for (const p of bestSellers) {
        expect(p.availability).toBe('in_stock')
      }
    })
  })
})
