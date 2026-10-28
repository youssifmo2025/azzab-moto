import type { OrderRepository } from '../interfaces/order-repository.interface'
import type { CreateOrderRequest, OrderConfirmation, OrderLookupResult } from './schemas/order'
import { OrderConfirmationSchema, OrderLookupResultSchema } from './schemas/order'
import { apiClient, ApiClient } from './client'

export class ApiOrderRepository implements OrderRepository {
  private client: ApiClient

  constructor(client: ApiClient = apiClient) {
    this.client = client
  }

  async createOrder(data: CreateOrderRequest, idempotencyKey?: string): Promise<OrderConfirmation> {
    const headers: Record<string, string> = {}
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey
    }

    return this.client.post<OrderConfirmation>('/api/orders', data, {
      headers,
      responseSchema: OrderConfirmationSchema,
    })
  }

  async lookupOrder(orderNumber: string, phone: string): Promise<OrderLookupResult> {
    return this.client.get<OrderLookupResult>('/api/orders/lookup', {
      params: { orderNumber, phone },
      responseSchema: OrderLookupResultSchema,
    })
  }
}
