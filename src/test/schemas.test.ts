import { describe, it, expect } from 'vitest'
import {
  CategorySchema,
  CategoriesArraySchema,
  ModelSchema,
  ModelsArraySchema,
  CompatibilitySchema,
  ProductSchema,
  ProductsArraySchema,
} from '@/services/schemas'

describe('Zod Schemas Validation', () => {
  describe('CategorySchema', () => {
    it('validates a correct category object', () => {
      const validCategory = {
        id: 'cat-brakes',
        slug: 'brakes',
        name: 'فرامل',
        icon: 'Disc',
        description: 'قطع فرامل أصلية',
      }
      const parsed = CategorySchema.safeParse(validCategory)
      expect(parsed.success).toBe(true)
    })

    it('rejects invalid category slugs (spaces or uppercase)', () => {
      const invalid = {
        id: 'cat-1',
        slug: 'Invalid Slug',
        name: 'فرامل',
        icon: 'Disc',
      }
      const parsed = CategorySchema.safeParse(invalid)
      expect(parsed.success).toBe(false)
    })

    it('rejects missing required category fields', () => {
      const invalid = {
        id: 'cat-1',
      }
      const parsed = CategorySchema.safeParse(invalid)
      expect(parsed.success).toBe(false)
    })

    it('validates an array of categories', () => {
      const array = [
        { id: 'cat-1', slug: 'cat-1', name: 'قسم 1', icon: 'Icon1' },
        { id: 'cat-2', slug: 'cat-2', name: 'قسم 2', icon: 'Icon2' },
      ]
      expect(CategoriesArraySchema.safeParse(array).success).toBe(true)
    })
  })

  describe('ModelSchema', () => {
    const validModel = {
      id: 'model-hlx-150',
      name: 'TVS HLX 150',
      years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
      imageUrl: '/images/models/hlx-150.webp',
    }

    it('validates a correct TVS motorcycle model', () => {
      expect(ModelSchema.safeParse(validModel).success).toBe(true)
    })

    it('validates an array of models', () => {
      expect(ModelsArraySchema.safeParse([validModel]).success).toBe(true)
    })

    it('rejects models with empty years array', () => {
      const invalid = {
        id: 'model-1',
        name: 'TVS HLX 150',
        years: [],
      }
      expect(ModelSchema.safeParse(invalid).success).toBe(false)
    })

    it('rejects models with invalid year bounds', () => {
      const invalid = {
        id: 'model-1',
        name: 'TVS HLX 150',
        years: [1950],
      }
      expect(ModelSchema.safeParse(invalid).success).toBe(false)
    })
  })

  describe('CompatibilitySchema', () => {
    it('validates correct year ranges', () => {
      const valid = {
        modelId: 'model-apache-160-4v',
        yearFrom: 2019,
        yearTo: 2024,
      }
      expect(CompatibilitySchema.safeParse(valid).success).toBe(true)
    })

    it('accepts same year for yearFrom and yearTo', () => {
      const valid = {
        modelId: 'model-apache-160-4v',
        yearFrom: 2022,
        yearTo: 2022,
      }
      expect(CompatibilitySchema.safeParse(valid).success).toBe(true)
    })

    it('rejects when yearTo is less than yearFrom', () => {
      const invalid = {
        modelId: 'model-apache-160-4v',
        yearFrom: 2024,
        yearTo: 2019,
      }
      const result = CompatibilitySchema.safeParse(invalid)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('greater than or equal to yearFrom')
      }
    })
  })

  describe('ProductSchema', () => {
    const validProduct = {
      id: 'prod-001',
      slug: 'front-brake-pads-apache-160',
      name: 'تيل فرامل أمامي أباتشي 160',
      nameEn: 'Front Brake Pads Apache 160',
      sku: 'AZB-BRK-001',
      partNumber: 'N9111330',
      categoryId: 'cat-brakes',
      price: 380,
      currency: 'EGP' as const,
      availability: 'in_stock' as const,
      images: ['/images/products/placeholder.webp'],
      description: 'تيل فرامل أمامي أصلي',
      compatibility: [{ modelId: 'model-apache-160-4v', yearFrom: 2019, yearTo: 2024 }],
    }

    it('validates a complete, properly-formed product', () => {
      const result = ProductSchema.safeParse(validProduct)
      expect(result.success).toBe(true)
    })

    it('rejects negative or zero prices', () => {
      expect(ProductSchema.safeParse({ ...validProduct, price: -50 }).success).toBe(false)
      expect(ProductSchema.safeParse({ ...validProduct, price: 0 }).success).toBe(false)
    })

    it('rejects currencies other than EGP', () => {
      expect(ProductSchema.safeParse({ ...validProduct, currency: 'USD' }).success).toBe(false)
    })

    it('rejects invalid availability values', () => {
      expect(
        ProductSchema.safeParse({ ...validProduct, availability: 'unknown_status' }).success,
      ).toBe(false)
    })

    it('rejects uppercase or invalid slug', () => {
      expect(ProductSchema.safeParse({ ...validProduct, slug: 'INVALID SLUG' }).success).toBe(false)
    })

    it('rejects empty images array', () => {
      expect(ProductSchema.safeParse({ ...validProduct, images: [] }).success).toBe(false)
    })

    it('allows missing partNumber and defaults to empty string', () => {
      const { partNumber: _pn, ...withoutPartNumber } = validProduct
      const result = ProductSchema.safeParse(withoutPartNumber)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.partNumber).toBe('')
      }
    })

    it('validates a list of products', () => {
      expect(ProductsArraySchema.safeParse([validProduct]).success).toBe(true)
    })
  })
})
