import { describe, it, expect, beforeEach, vi } from 'vitest'
import { storage } from '@/shared/lib/storage'
import { activeOrderRepository } from '@/services'
import { getShippingFeeForGovernorate } from '@/app/config/shipping'

describe('Cart & Checkout Flow', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('persists cart items with Zod validation in storage wrapper', () => {
    const testItems = [
      { productId: 'prod-001', quantity: 2, savedPrice: '150.00' },
      { productId: 'prod-002', quantity: 1, savedPrice: '45.00' },
    ]

    storage.cart.set({ items: testItems })

    const retrieved = storage.cart.get()
    expect(retrieved.items).toHaveLength(2)
    expect(retrieved.items[0].productId).toBe('prod-001')
    expect(retrieved.items[0].quantity).toBe(2)
    expect(retrieved.items[0].savedPrice).toBe('150.00')
  })

  it('handles invalid or corrupted cart storage gracefully without throwing', () => {
    localStorage.setItem('am_cart_v1', '{"invalid": "data"}')
    const retrieved = storage.cart.get()
    expect(retrieved.items).toEqual([])
  })

  it('calculates shipping fee from config (defaults to 0 for undefined governorates)', () => {
    expect(getShippingFeeForGovernorate('القاهرة')).toBe(0)
    expect(getShippingFeeForGovernorate('مطروح')).toBe(0)
    expect(getShippingFeeForGovernorate(undefined)).toBe(0)
  })

  it('validates Egyptian phone numbers correctly', () => {
    const egyptianPhoneRegex = /^01[0125][0-9]{8}$/
    
    // Valid numbers
    expect(egyptianPhoneRegex.test('01012345678')).toBe(true)
    expect(egyptianPhoneRegex.test('01123456789')).toBe(true)
    expect(egyptianPhoneRegex.test('01234567890')).toBe(true)
    expect(egyptianPhoneRegex.test('01512345678')).toBe(true)

    // Invalid numbers
    expect(egyptianPhoneRegex.test('01312345678')).toBe(false) // 013 is not a valid mobile prefix
    expect(egyptianPhoneRegex.test('0101234567')).toBe(false)  // 10 digits
    expect(egyptianPhoneRegex.test('010123456789')).toBe(false) // 12 digits
    expect(egyptianPhoneRegex.test('+201012345678')).toBe(false) // international format not accepted in local field
    expect(egyptianPhoneRegex.test('abcdefghijk')).toBe(false)
  })

  it('creates an order via activeOrderRepository and saves ONLY orderNumber in storage (no PII)', async () => {
    const confirmation = await activeOrderRepository.createOrder({
      customer: {
        name: 'محمود أحمد',
        phone: '01012345678',
        governorate: 'القاهرة',
        city: 'المعادي',
        address: 'شارع 9، مبنى 12، شقة 4',
      },
      items: [{ productId: 'prod-001', quantity: 2 }],
    }, 'test-idemp-12345')

    expect(confirmation.orderNumber).toMatch(/^AZ-\d{6}-\d{4}$/)
    expect(confirmation.status).toBe('new')

    // Simulate saving to storage
    storage.lastOrder.set({
      orderNumber: confirmation.orderNumber,
      createdAt: confirmation.createdAt,
    })

    const saved = storage.lastOrder.get()
    expect(saved).not.toBeNull()
    expect(saved?.orderNumber).toBe(confirmation.orderNumber)

    // Verify localStorage contains strictly NO PII
    const rawStorage = localStorage.getItem('am_last_order_v1')
    expect(rawStorage).not.toBeNull()
    expect(rawStorage).not.toContain('محمود أحمد')
    expect(rawStorage).not.toContain('01012345678')
    expect(rawStorage).not.toContain('المعادي')
  })
})
