import { describe, it, expect } from 'vitest'
import { buildOrderMessage, buildWhatsAppUrl } from '@/shared/lib/whatsapp'
import { checkProductCompatibility } from '@/features/product/utils/compatibility'
import { productRepository } from '@/services/json'

describe('Product WhatsApp Order Message', () => {
  it('generates a complete prefilled order message including product URL', () => {
    const params = {
      productName: 'تيل فرامل أمامي أصلي TVS أباتشي',
      sku: 'AZB-BRK-001',
      partNumber: 'N9111330',
      price: 380,
      productUrl: 'https://azzabmoto.com/products/front-brake-pads-apache-160-200',
    }

    const message = buildOrderMessage(params)

    expect(message).toContain('تيل فرامل أمامي أصلي TVS أباتشي')
    expect(message).toContain('AZB-BRK-001')
    expect(message).toContain('N9111330')
    expect(message).toContain('380 ج.م')
    expect(message).toContain('https://azzabmoto.com/products/front-brake-pads-apache-160-200')
    expect(message).toContain('هل القطعة متوفرة حالياً؟')

    const url = buildWhatsAppUrl(message)
    expect(url).toContain('https://wa.me/201141334668?text=')
    expect(url).toContain(encodeURIComponent('AZB-BRK-001'))
  })

  it('omits optional partNumber and productUrl if not provided', () => {
    const message = buildOrderMessage({
      productName: 'فلتر زيت',
      sku: 'AZB-FLT-001',
    })

    expect(message).toContain('فلتر زيت')
    expect(message).toContain('AZB-FLT-001')
    expect(message).not.toContain('رقم القطعة الأصلي')
    expect(message).not.toContain('رابط القطعة')
  })
})

describe('Product Compatibility Logic', () => {
  const sampleCompatibility = [
    { modelId: 'model-apache-160-4v', yearFrom: 2019, yearTo: 2024 },
    { modelId: 'model-apache-200-4v', yearFrom: 2018, yearTo: 2024 },
  ]

  it('returns isChecked: false when no model is selected', () => {
    const res = checkProductCompatibility(sampleCompatibility, undefined)
    expect(res.isChecked).toBe(false)
    expect(res.isCompatible).toBe(false)
  })

  it('returns isCompatible: true when model matches without year specified', () => {
    const res = checkProductCompatibility(sampleCompatibility, 'model-apache-160-4v')
    expect(res.isChecked).toBe(true)
    expect(res.isCompatible).toBe(true)
    expect(res.matchedRange).toEqual({ yearFrom: 2019, yearTo: 2024 })
  })

  it('verifies exact boundary years for compatibility', () => {
    // yearFrom boundary
    const resFrom = checkProductCompatibility(sampleCompatibility, 'model-apache-160-4v', 2019)
    expect(resFrom.isCompatible).toBe(true)

    // yearTo boundary
    const resTo = checkProductCompatibility(sampleCompatibility, 'model-apache-160-4v', 2024)
    expect(resTo.isCompatible).toBe(true)

    // Mid year
    const resMid = checkProductCompatibility(sampleCompatibility, 'model-apache-160-4v', 2021)
    expect(resMid.isCompatible).toBe(true)
  })

  it('returns isCompatible: false for years outside production range', () => {
    // Before yearFrom
    const resBefore = checkProductCompatibility(sampleCompatibility, 'model-apache-160-4v', 2018)
    expect(resBefore.isChecked).toBe(true)
    expect(resBefore.isCompatible).toBe(false)

    // After yearTo
    const resAfter = checkProductCompatibility(sampleCompatibility, 'model-apache-160-4v', 2025)
    expect(resAfter.isChecked).toBe(true)
    expect(resAfter.isCompatible).toBe(false)
  })

  it('returns isCompatible: false for unlisted motorcycle models', () => {
    const resUnlisted = checkProductCompatibility(sampleCompatibility, 'model-jupiter-110', 2022)
    expect(resUnlisted.isChecked).toBe(true)
    expect(resUnlisted.isCompatible).toBe(false)
  })

  it('handles null or empty compatibility lists gracefully', () => {
    expect(checkProductCompatibility([], 'model-apache-160-4v').isCompatible).toBe(false)
    expect(checkProductCompatibility(null, 'model-apache-160-4v').isCompatible).toBe(false)
  })
})

describe('Product Repository Slug Lookups', () => {
  it('returns null for unknown product slug (triggering 404)', async () => {
    const product = await productRepository.getBySlug('non-existent-product-slug-xyz')
    expect(product).toBeNull()
  })

  it('retrieves full product details for a valid existing slug', async () => {
    const product = await productRepository.getBySlug('front-brake-pads-apache-160-200')
    expect(product).not.toBeNull()
    expect(product?.name).toBe('تيل فرامل أمامي أصلي TVS أباتشي')
    expect(product?.sku).toBe('AZB-BRK-001')
    expect(product?.price).toBe(380)
    expect(product?.availability).toBe('in_stock')
    expect(product?.compatibility.length).toBeGreaterThan(0)
  })
})
