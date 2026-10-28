import { describe, it, expect } from 'vitest'
import { activeOrderRepository } from '@/services'

describe('Order Tracking Feature', () => {
  it('looks up a valid order with order number and customer phone successfully', async () => {
    // 1. Create an order first
    const created = await activeOrderRepository.createOrder({
      customer: {
        name: 'كريم محمود',
        phone: '01123456789',
        governorate: 'الجيزة',
        city: 'الدقي',
        address: 'شارع مصدق، عمارة 15',
      },
      items: [{ productId: 'prod-001', quantity: 1 }],
    })

    expect(created.orderNumber).toBeDefined()

    // 2. Lookup the order
    const lookup = await activeOrderRepository.lookupOrder(created.orderNumber, '01123456789')
    expect(lookup.orderNumber).toBe(created.orderNumber)
    expect(lookup.status).toBe('new')
    expect(lookup.governorate).toBe('الجيزة')
    expect(lookup.itemsCount).toBe(1)
    expect(lookup.total).toBe(created.total)
  })

  it('rejects lookup with mismatching phone number using generic error', async () => {
    const created = await activeOrderRepository.createOrder({
      customer: {
        name: 'كريم محمود',
        phone: '01123456789',
        governorate: 'الجيزة',
        city: 'الدقي',
        address: 'شارع مصدق، عمارة 15',
      },
      items: [{ productId: 'prod-001', quantity: 1 }],
    })

    await expect(
      activeOrderRepository.lookupOrder(created.orderNumber, '01099999999'),
    ).rejects.toThrow('رقم الطلب أو رقم الهاتف غير مطابق لبيانات مسجلة لدينا')
  })

  it('rejects lookup for non-existent order number', async () => {
    await expect(
      activeOrderRepository.lookupOrder('AZ-999999-9999', '01012345678'),
    ).rejects.toThrow('رقم الطلب أو رقم الهاتف غير مطابق لبيانات مسجلة لدينا')
  })
})

