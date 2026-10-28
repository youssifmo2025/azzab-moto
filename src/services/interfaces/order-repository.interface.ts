import type { CreateOrderRequest, OrderConfirmation, OrderLookupResult } from '../api/schemas/order'

export interface OrderRepository {
  createOrder(data: CreateOrderRequest, idempotencyKey?: string): Promise<OrderConfirmation>
  lookupOrder(orderNumber: string, phone: string): Promise<OrderLookupResult>
}

