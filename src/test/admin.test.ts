import { describe, it, expect, beforeEach } from 'vitest'
import { ApiClient } from '@/services/api/client'
import { ApiClientError } from '@/services/api/schemas/error'
import { setMockUser } from '@/services/mock/handlers/auth'
import type { AdminOrderDetail } from '@/services/api/schemas/order'

describe('Admin Dashboard API & Role Enforcements', () => {
  let client: ApiClient

  beforeEach(() => {
    client = new ApiClient('')
    setMockUser({
      id: 'usr-1',
      username: 'admin',
      name: 'مدير النظام',
      role: 'admin',
      disabled: false,
      mustChangePassword: false,
    })
  })

  it('allows both admin and orders_manager to fetch dashboard summary', async () => {
    // 1. As admin
    const adminSummary = await client.get<{ todayOrdersCount: number }>('/api/admin/dashboard')
    expect(adminSummary).toHaveProperty('todayOrdersCount')

    // 2. As orders_manager
    setMockUser({
      id: 'usr-2',
      username: 'manager',
      name: 'مسؤول الطلبات',
      role: 'orders_manager',
      disabled: false,
      mustChangePassword: false,
    })
    const managerSummary = await client.get<{ todayOrdersCount: number }>('/api/admin/dashboard')
    expect(managerSummary).toHaveProperty('todayOrdersCount')
  })

  it('allows orders_manager to update order status before delivery', async () => {
    setMockUser({
      id: 'usr-2',
      username: 'manager',
      name: 'مسؤول الطلبات',
      role: 'orders_manager',
      disabled: false,
      mustChangePassword: false,
    })

    const updated = await client.patch<AdminOrderDetail>('/api/admin/orders/ord-101/status', {
      status: 'processing',
      note: 'جاري التجهيز بواسطة مسؤول الطلبات',
    })
    expect(updated.status).toBe('processing')
  })

  it('forbids orders_manager from deleting a category (403 Forbidden)', async () => {
    setMockUser({
      id: 'usr-2',
      username: 'manager',
      name: 'مسؤول الطلبات',
      role: 'orders_manager',
      disabled: false,
      mustChangePassword: false,
    })

    try {
      await client.delete('/api/admin/categories/cat-brakes')
      expect.fail('Should have failed with 403')
    } catch (err) {
      const apiErr = err as ApiClientError
      expect(apiErr.status).toBe(403)
      expect(apiErr.code).toBe('FORBIDDEN')
    }
  })

  it('blocks category deletion with 409 Conflict if category contains products', async () => {
    // As admin
    try {
      await client.delete('/api/admin/categories/cat-brakes')
      expect.fail('Should have thrown 409 Conflict')
    } catch (err) {
      const apiErr = err as ApiClientError
      expect(apiErr.status).toBe(409)
      expect(apiErr.code).toBe('CATEGORY_NOT_EMPTY')
    }
  })

  it('forces change-password screen for newly created users or users with mustChangePassword=true', async () => {
    // Create new orders_manager user
    const res = await client.post<{ user: { username: string; mustChangePassword: boolean }; temporaryPassword: string }>(
      '/api/admin/users',
      { username: 'new_staff_1', name: 'أحمد سعيد', role: 'orders_manager' },
    )

    expect(res.user.mustChangePassword).toBe(true)
    expect(res.temporaryPassword).toBeDefined()
    expect(res.temporaryPassword.length).toBeGreaterThanOrEqual(8)
  })

  it('allows admin to reset password and marks mustChangePassword=true', async () => {
    const res = await client.post<{ success: boolean; temporaryPassword: string }>(
      '/api/admin/users/usr-2/reset-password',
    )
    expect(res.success).toBe(true)
    expect(res.temporaryPassword).toBeDefined()
  })
})

