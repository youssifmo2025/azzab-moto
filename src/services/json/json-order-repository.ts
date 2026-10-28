import { z } from 'zod'
import type { OrderRepository } from '../interfaces/order-repository.interface'
import type { CreateOrderRequest, OrderConfirmation, OrderLookupResult } from '../api/schemas/order'
import { readStorage, writeStorage } from '@/shared/lib/storage'
import rawProducts from '@/data/products.json'

const STORAGE_ORDERS_KEY = 'am_demo_orders_v1'

const StoredOrderSchema = z.object({
  orderNumber: z.string(),
  status: z.enum(['new', 'processing', 'shipped', 'delivered', 'cancelled']),
  total: z.string(),
  subtotal: z.string(),
  shippingFee: z.string(),
  currency: z.literal('EGP'),
  items: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      price: z.string(),
      quantity: z.number(),
      total: z.string(),
    }),
  ),
  customer: z.object({
    name: z.string(),
    phone: z.string(),
    governorate: z.string(),
    address: z.string(),
    notes: z.string().optional(),
  }),
  createdAt: z.string(),
})

type StoredOrder = z.infer<typeof StoredOrderSchema>

function getStoredOrders(): StoredOrder[] {
  return readStorage<StoredOrder[]>(STORAGE_ORDERS_KEY, z.array(StoredOrderSchema), [])
}

function saveStoredOrders(orders: StoredOrder[]): void {
  writeStorage(STORAGE_ORDERS_KEY, orders)
}

export class JsonOrderRepository implements OrderRepository {
  async createOrder(data: CreateOrderRequest): Promise<OrderConfirmation> {
    const orderNum = `AZ-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`
    
    let subtotalNum = 0
    const items = data.items.map((item) => {
      const prod = rawProducts.find((p) => p.id === item.productId)
      const priceNum = prod ? prod.price : 100
      const itemTotalNum = priceNum * item.quantity
      subtotalNum += itemTotalNum
      return {
        productId: item.productId,
        productName: prod ? prod.name : 'منتج غير معروف',
        price: priceNum.toFixed(2),
        quantity: item.quantity,
        total: itemTotalNum.toFixed(2),
      }
    })

    const shippingFee = '0.00'
    const total = subtotalNum.toFixed(2)
    const createdAt = new Date().toISOString()

    const confirmation: OrderConfirmation = {
      orderNumber: orderNum,
      status: 'new',
      total,
      subtotal: total,
      shippingFee,
      currency: 'EGP',
      items,
      customer: data.customer,
      createdAt,
    }

    const existing = getStoredOrders()
    existing.unshift(confirmation)
    saveStoredOrders(existing)

    return confirmation
  }

  async lookupOrder(orderNumber: string, phone: string): Promise<OrderLookupResult> {
    const existing = getStoredOrders()
    const found = existing.find(
      (o) => o.orderNumber.toUpperCase() === orderNumber.trim().toUpperCase() && o.customer.phone === phone.trim(),
    )

    if (!found) {
      throw new Error('رقم الطلب أو رقم الهاتف غير مطابق لبيانات مسجلة لدينا')
    }

    return {
      orderNumber: found.orderNumber,
      status: found.status,
      createdAt: found.createdAt,
      total: found.total,
      itemsCount: found.items.reduce((acc, i) => acc + i.quantity, 0),
      governorate: found.customer.governorate,
    }
  }
}

