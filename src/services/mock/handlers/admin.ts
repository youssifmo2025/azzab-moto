import { http, HttpResponse, delay } from 'msw'
import { orders } from './orders'
import {
  mockCategories,
  type MockProduct,
  saveDemoOrders,
  loadDemoProducts,
  saveDemoProducts,
} from '../data/mock-data'
import { getCurrentUser } from './auth'
import type { OrderStatus } from '@/services/api/schemas/order'

export interface ExtendedMockProduct extends MockProduct {
  isActive: boolean
}

const adminProducts: ExtendedMockProduct[] = loadDemoProducts().map((p) => ({
  ...p,
  isActive: (p as ExtendedMockProduct).isActive ?? true,
}))

const adminCategories = [...mockCategories]

const staffUsers = [
  { id: 'usr-1', username: 'admin', name: 'مدير النظام', role: 'admin' as const, disabled: false, mustChangePassword: false },
  { id: 'usr-2', username: 'manager', name: 'مسؤول الطلبات', role: 'orders_manager' as const, disabled: false, mustChangePassword: false },
]

function checkRole(allowedRoles: Array<'admin' | 'orders_manager'>): HttpResponse | null {
  const user = getCurrentUser()
  if (!user) {
    return HttpResponse.json(
      { code: 'UNAUTHENTICATED', message: 'انتهت الجلسة، يرجى تسجيل الدخول' },
      { status: 401 },
    )
  }
  if (!allowedRoles.includes(user.role)) {
    return HttpResponse.json(
      { code: 'FORBIDDEN', message: 'غير مصرح لك بإجراء هذه العملية' },
      { status: 403 },
    )
  }
  return null
}

export const adminHandlers = [
  // ── 1. Dashboard summary KPIs (admin & orders_manager) ─────────────────────
  http.get('/api/admin/dashboard', async () => {
    await delay(150)
    const authErr = checkRole(['admin', 'orders_manager'])
    if (authErr) return authErr

    const today = new Date().toISOString().slice(0, 10)
    const todayOrders = orders.filter((o) => o.createdAt.startsWith(today))
    const todayTotalNum = todayOrders.reduce((sum, o) => sum + parseFloat(o.total), 0)

    const statusCounts = {
      new: orders.filter((o) => o.status === 'new').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    }

    const pendingOrdersCount = statusCounts.new + statusCounts.processing
    const lowStockCount = adminProducts.filter(
      (p) => p.stockQuantity !== null && p.stockQuantity !== undefined && p.stockQuantity <= 5,
    ).length

    return HttpResponse.json({
      todayOrdersCount: todayOrders.length,
      todayOrdersTotal: todayTotalNum.toFixed(2),
      pendingOrdersCount,
      lowStockCount,
      statusCounts,
    })
  }),

  // ── 2. Orders list (admin & orders_manager) ────────────────────────────────
  http.get('/api/admin/orders', async ({ request }) => {
    await delay(150)
    const authErr = checkRole(['admin', 'orders_manager'])
    if (authErr) return authErr

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const perPage = parseInt(url.searchParams.get('perPage') || '20', 10)
    const status = url.searchParams.get('status')
    const governorate = url.searchParams.get('governorate')
    const q = url.searchParams.get('q')

    let filtered = [...orders]

    if (status) {
      filtered = filtered.filter((o) => o.status === status)
    }

    if (governorate) {
      filtered = filtered.filter((o) => o.customer.governorate === governorate)
    }

    if (q) {
      const query = q.trim().toLowerCase()
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.customer.phone.includes(query) ||
          o.customer.name.toLowerCase().includes(query),
      )
    }

    const total = filtered.length
    const totalPages = Math.ceil(total / perPage) || 1
    const offset = (page - 1) * perPage
    const paged = filtered.slice(offset, offset + perPage)

    return HttpResponse.json({
      data: paged.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customer.name,
        phone: o.customer.phone,
        governorate: o.customer.governorate,
        status: o.status,
        total: o.total,
        itemsCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
        createdAt: o.createdAt,
      })),
      meta: { page, perPage, total, totalPages },
    })
  }),

  // ── 3. Order detail (admin & orders_manager) ───────────────────────────────
  http.get('/api/admin/orders/:id', async ({ params }) => {
    await delay(100)
    const authErr = checkRole(['admin', 'orders_manager'])
    if (authErr) return authErr

    const { id } = params
    const order = orders.find((o) => o.id === id || o.orderNumber === id)

    if (!order) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'الطلب غير موجود' }, { status: 404 })
    }

    return HttpResponse.json(order)
  }),

  // ── 4. Update order status (admin & orders_manager) ────────────────────────
  http.patch('/api/admin/orders/:id/status', async ({ params, request }) => {
    await delay(200)
    const authErr = checkRole(['admin', 'orders_manager'])
    if (authErr) return authErr

    const { id } = params
    const order = orders.find((o) => o.id === id || o.orderNumber === id)

    if (!order) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'الطلب غير موجود' }, { status: 404 })
    }

    const body = (await request.json()) as { status: OrderStatus; note?: string }

    if (order.status === 'delivered' && body.status === 'cancelled') {
      return HttpResponse.json(
        {
          code: 'INVALID_TRANSITION',
          message: 'لا يمكن إلغاء طلب تم تسليمه بالفعل للعميل واستلام قيمته',
        },
        { status: 400 },
      )
    }

    order.status = body.status
    order.history.push({
      status: body.status,
      changedAt: new Date().toISOString(),
      changedBy: getCurrentUser()?.name || 'Admin',
      note: body.note,
    })
    saveDemoOrders(orders)

    return HttpResponse.json(order)
  }),

  // ── 5. CSV export (Role: admin only) ───────────────────────────────────────
  http.get('/api/admin/orders/export/csv', async () => {
    await delay(300)
    const authErr = checkRole(['admin'])
    if (authErr) return authErr

    const headers = ['رقم الطلب', 'تاريخ الإنشاء', 'اسم العميل', 'رقم الهاتف', 'المحافظة', 'الحالة', 'الإجمالي']
    const rows = orders.map((o) => [
      `'${o.orderNumber}`,
      o.createdAt,
      `'${o.customer.name}`,
      `'${o.customer.phone}`,
      o.customer.governorate,
      o.status,
      o.total,
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    return new HttpResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="orders-export.csv"',
      },
    })
  }),

  // ── 6. Admin Products List (admin & orders_manager: stock visibility) ──────
  http.get('/api/admin/products', async ({ request }) => {
    await delay(100)
    const authErr = checkRole(['admin', 'orders_manager'])
    if (authErr) return authErr

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const perPage = parseInt(url.searchParams.get('perPage') || '20', 10)

    const total = adminProducts.length
    const totalPages = Math.ceil(total / perPage) || 1
    const offset = (page - 1) * perPage

    return HttpResponse.json({
      data: adminProducts.slice(offset, offset + perPage),
      meta: { page, perPage, total, totalPages },
    })
  }),

  // ── 7. Single product by ID for admin editor (admin & orders_manager) ───────
  http.get('/api/admin/products/:id', async ({ params }) => {
    await delay(100)
    const authErr = checkRole(['admin', 'orders_manager'])
    if (authErr) return authErr

    const { id } = params
    const product = adminProducts.find((p) => p.id === id)
    if (!product) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'المنتج غير موجود' }, { status: 404 })
    }
    return HttpResponse.json(product)
  }),

  // ── 8. Create product (Role: admin ONLY) ────────────────────────────────────
  http.post('/api/admin/products', async ({ request }) => {
    await delay(200)
    const authErr = checkRole(['admin'])
    if (authErr) return authErr

    const body = (await request.json()) as Partial<ExtendedMockProduct>
    const newProduct: ExtendedMockProduct = {
      id: `prod-${Date.now()}`,
      slug: (body.nameEn || 'new-part').toLowerCase().replace(/\s+/g, '-'),
      name: body.name || '',
      nameEn: body.nameEn || '',
      sku: body.sku || `TVS-${Math.floor(1000 + Math.random() * 9000)}`,
      partNumber: body.partNumber || '',
      categoryId: body.categoryId || 'cat-brakes',
      price: body.price || '100.00',
      currency: 'EGP',
      availability: body.availability || 'in_stock',
      stockQuantity: body.stockQuantity ?? 10,
      images: body.images || ['/placeholder.jpg'],
      description: body.description || '',
      compatibility: body.compatibility || [],
      isActive: body.isActive ?? true,
    }
    adminProducts.unshift(newProduct)
    saveDemoProducts(adminProducts)
    return HttpResponse.json(newProduct, { status: 201 })
  }),

  // ── 9. Update product & Soft Delete (Role: admin ONLY) ───────────────────────
  http.patch('/api/admin/products/:id', async ({ params, request }) => {
    await delay(150)
    const authErr = checkRole(['admin'])
    if (authErr) return authErr

    const { id } = params
    const product = adminProducts.find((p) => p.id === id)
    if (!product) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'المنتج غير موجود' }, { status: 404 })
    }
    const body = (await request.json()) as Partial<ExtendedMockProduct>
    Object.assign(product, body)
    saveDemoProducts(adminProducts)
    return HttpResponse.json(product)
  }),

  // ── 10. Upload product images (Role: admin ONLY) ────────────────────────────
  http.post('/api/admin/products/:id/images', async ({ params }) => {
    await delay(200)
    const authErr = checkRole(['admin'])
    if (authErr) return authErr

    const { id } = params
    const product = adminProducts.find((p) => p.id === id)
    if (!product) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'المنتج غير موجود' }, { status: 404 })
    }

    const uploadedUrls = [`/images/products/upload-${Date.now()}.webp`]
    product.images.push(...uploadedUrls)
    saveDemoProducts(adminProducts)
    return HttpResponse.json(uploadedUrls, { status: 201 })
  }),

  // ── 11. Delete single product image (Role: admin ONLY) ──────────────────────
  http.delete('/api/admin/products/:id/images/:imageId', async ({ params }) => {
    await delay(150)
    const authErr = checkRole(['admin'])
    if (authErr) return authErr

    const { id, imageId } = params
    const product = adminProducts.find((p) => p.id === id)
    if (!product) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'المنتج غير موجود' }, { status: 404 })
    }

    product.images = product.images.filter((img) => !img.includes(String(imageId)))
    saveDemoProducts(adminProducts)
    return HttpResponse.json({ success: true, message: 'تم حذف الصورة بنجاح' })
  }),

  // ── 12. Reorder product images + primary image (Role: admin ONLY) ───────────
  http.put('/api/admin/products/:id/images/reorder', async ({ params, request }) => {
    await delay(150)
    const authErr = checkRole(['admin'])
    if (authErr) return authErr

    const { id } = params
    const product = adminProducts.find((p) => p.id === id)
    if (!product) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'المنتج غير موجود' }, { status: 404 })
    }

    const body = (await request.json()) as { images: string[] }
    if (Array.isArray(body.images)) {
      product.images = body.images
    }
    saveDemoProducts(adminProducts)
    return HttpResponse.json({ success: true, images: product.images })
  }),

  // ── 13. Admin Categories List (admin & orders_manager) ─────────────────────
  http.get('/api/admin/categories', async () => {
    await delay(100)
    const authErr = checkRole(['admin', 'orders_manager'])
    if (authErr) return authErr

    return HttpResponse.json(adminCategories)
  }),

  // ── 14. Create category (Role: admin ONLY) ──────────────────────────────────
  http.post('/api/admin/categories', async ({ request }) => {
    await delay(150)
    const authErr = checkRole(['admin'])
    if (authErr) return authErr

    const body = (await request.json()) as { name: string; slug: string; icon: string; description?: string }
    const newCat = {
      id: `cat-${Date.now()}`,
      slug: body.slug,
      name: body.name,
      icon: body.icon,
      description: body.description ?? '',
    }
    adminCategories.push(newCat)
    return HttpResponse.json(newCat, { status: 201 })
  }),

  // ── 15. Update category (Role: admin ONLY) ──────────────────────────────────
  http.patch('/api/admin/categories/:id', async ({ params, request }) => {
    await delay(100)
    const authErr = checkRole(['admin'])
    if (authErr) return authErr

    const { id } = params
    const cat = adminCategories.find((c) => c.id === id)
    if (!cat) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'التصنيف غير موجود' }, { status: 404 })
    }
    const body = (await request.json()) as Partial<typeof cat>
    Object.assign(cat, body)
    return HttpResponse.json(cat)
  }),

  // ── 16. Reorder categories (Role: admin ONLY) ───────────────────────────────
  http.put('/api/admin/categories/reorder', async ({ request }) => {
    await delay(150)
    const authErr = checkRole(['admin'])
    if (authErr) return authErr

    const body = (await request.json()) as { categoryIds: string[] }
    if (Array.isArray(body.categoryIds)) {
      const orderMap = new Map(body.categoryIds.map((id, idx) => [id, idx]))
      adminCategories.sort((a, b) => (orderMap.get(a.id) ?? 99) - (orderMap.get(b.id) ?? 99))
    }
    return HttpResponse.json({ success: true, categories: adminCategories })
  }),

  // ── 17. Delete category (Role: admin ONLY, blocked if in use) ───────────────
  http.delete('/api/admin/categories/:id', async ({ params }) => {
    await delay(150)
    const authErr = checkRole(['admin'])
    if (authErr) return authErr

    const { id } = params
    const cat = adminCategories.find((c) => c.id === id)
    if (!cat) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'التصنيف غير موجود' }, { status: 404 })
    }

    const hasProducts = adminProducts.some((p) => p.categoryId === cat.id || p.categoryId === cat.slug)
    if (hasProducts) {
      return HttpResponse.json(
        {
          code: 'CATEGORY_NOT_EMPTY',
          message: 'لا يمكن حذف التصنيف لأنه يحتوي على قطع غيار مرتبطة به',
        },
        { status: 409 },
      )
    }

    const idx = adminCategories.indexOf(cat)
    adminCategories.splice(idx, 1)
    return HttpResponse.json({ success: true, message: 'تم حذف التصنيف بنجاح' })
  }),

  // ── 18. User management (Role: admin ONLY) ──────────────────────────────────
  http.get('/api/admin/users', async () => {
    await delay(80)
    const authErr = checkRole(['admin'])
    if (authErr) return authErr

    return HttpResponse.json(staffUsers)
  }),

  http.post('/api/admin/users', async ({ request }) => {
    await delay(150)
    const authErr = checkRole(['admin'])
    if (authErr) return authErr

    const body = (await request.json()) as { username: string; name: string; role: 'orders_manager' }
    const temporaryPassword = `Tmp@${Math.floor(100000 + Math.random() * 900000)}`
    const newUser = {
      id: `usr-${Date.now()}`,
      username: body.username,
      name: body.name,
      role: body.role,
      disabled: false,
      mustChangePassword: true,
    }
    staffUsers.push(newUser)
    return HttpResponse.json({ user: newUser, temporaryPassword }, { status: 201 })
  }),

  http.patch('/api/admin/users/:id/disable', async ({ params }) => {
    await delay(100)
    const authErr = checkRole(['admin'])
    if (authErr) return authErr

    const { id } = params
    const user = staffUsers.find((u) => u.id === id)
    if (!user) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'المستخدم غير موجود' }, { status: 404 })
    }
    user.disabled = true
    return HttpResponse.json({ success: true, message: 'تم إيقاف تفعيل الحساب' })
  }),

  http.patch('/api/admin/users/:id/enable', async ({ params }) => {
    await delay(100)
    const authErr = checkRole(['admin'])
    if (authErr) return authErr

    const { id } = params
    const user = staffUsers.find((u) => u.id === id)
    if (!user) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'المستخدم غير موجود' }, { status: 404 })
    }
    user.disabled = false
    return HttpResponse.json({ success: true, message: 'تمت إعادة تفعيل الحساب' })
  }),

  http.post('/api/admin/users/:id/reset-password', async ({ params }) => {
    await delay(150)
    const authErr = checkRole(['admin'])
    if (authErr) return authErr

    const { id } = params
    const user = staffUsers.find((u) => u.id === id)
    if (!user) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'المستخدم غير موجود' }, { status: 404 })
    }

    const temporaryPassword = `Rst@${Math.floor(100000 + Math.random() * 900000)}`
    user.mustChangePassword = true

    return HttpResponse.json({
      success: true,
      temporaryPassword,
      message: 'تم إعادة تعيين كلمة المرور بنجاح. يجب على الموظف تغييرها عند تسجيل الدخول الأول.',
    })
  }),
]
