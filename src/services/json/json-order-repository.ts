import type { OrderRepository } from '../interfaces/order-repository.interface'
import type { CreateOrderRequest, OrderConfirmation, OrderLookupResult } from '../api/schemas/order'
import rawProducts from '@/data/products.json'

const STORAGE_ORDERS_KEY = 'am_demo_orders_v1'

interface StoredOrder {
  orderNumber: string
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: string
  subtotal: string
  shippingFee: string
  currency: 'EGP'
  items: Array<{
    productId: string
    productName: string
    price: string
    quantity: number
    total: string
  }>
  customer: CreateOrderRequest['customer']
  createdAt: string
}

function getStoredOrders(): StoredOrder[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_ORDERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveStoredOrders(orders: StoredOrder[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders))
  } catch {
    // Ignore storage quota errors in demo mode
  }
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
