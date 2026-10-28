import { http, HttpResponse, delay } from 'msw'
import { orders } from './orders'
import { initialMockProducts, mockCategories, type MockProduct } from '../data/mock-data'
import type { OrderStatus } from '@/services/api/schemas/order'

const adminProducts: MockProduct[] = [...initialMockProducts]
const adminCategories = [...mockCategories]

const staffUsers = [
  { id: 'usr-1', username: 'admin', name: 'مدير النظام', role: 'admin', disabled: false },
  { id: 'usr-2', username: 'manager', name: 'مسؤول الطلبات', role: 'orders_manager', disabled: false },
]

export const adminHandlers = [
  // Dashboard summary KPIs
  http.get('/api/admin/dashboard', async () => {
    await delay(150)
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

  // Orders list
  http.get('/api/admin/orders', async ({ request }) => {
    await delay(150)
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

  // Order detail
  http.get('/api/admin/orders/:id', async ({ params }) => {
    await delay(100)
    const { id } = params
    const order = orders.find((o) => o.id === id || o.orderNumber === id)

    if (!order) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'الطلب غير موجود' }, { status: 404 })
    }

    return HttpResponse.json(order)
  }),

  // Update order status
  http.patch('/api/admin/orders/:id/status', async ({ params, request }) => {
    await delay(200)
    const { id } = params
    const order = orders.find((o) => o.id === id || o.orderNumber === id)

    if (!order) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'الطلب غير موجود' }, { status: 404 })
    }

    const body = (await request.json()) as { status: OrderStatus; note?: string }

    // State machine check
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
      changedBy: 'Admin',
      note: body.note,
    })

    return HttpResponse.json(order)
  }),

  // CSV export
  http.get('/api/admin/orders/export/csv', async () => {
    await delay(300)
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

  // Admin products
  http.get('/api/admin/products', async ({ request }) => {
    await delay(100)
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

  http.post('/api/admin/products', async ({ request }) => {
    await delay(200)
    const body = (await request.json()) as Partial<MockProduct>
    const newProduct: MockProduct = {
      id: `prod-${Date.now()}`,
      slug: (body.nameEn || 'new-part').toLowerCase().replace(/\s+/g, '-'),
      name: body.name || '',
      nameEn: body.nameEn || '',
      sku: body.sku || `TVS-${Math.floor(1000 + Math.random() * 9000)}`,
      partNumber: body.partNumber || '',
      categoryId: body.categoryId || 'engine',
      price: body.price || '100.00',
      currency: 'EGP',
      availability: body.availability || 'in_stock',
      stockQuantity: body.stockQuantity ?? 10,
      images: body.images || ['/placeholder.jpg'],
      description: body.description || '',
      compatibility: body.compatibility || [],
    }
    adminProducts.unshift(newProduct)
    return HttpResponse.json(newProduct, { status: 201 })
  }),

  http.patch('/api/admin/products/:id', async ({ params, request }) => {
    await delay(150)
    const { id } = params
    const product = adminProducts.find((p) => p.id === id)
    if (!product) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'المنتج غير موجود' }, { status: 404 })
    }
    const body = (await request.json()) as Partial<MockProduct>
    Object.assign(product, body)
    return HttpResponse.json(product)
  }),

  http.delete('/api/admin/products/:id', async ({ params }) => {
    await delay(150)
    const { id } = params
    const idx = adminProducts.findIndex((p) => p.id === id)
    if (idx !== -1) {
      adminProducts.splice(idx, 1)
    }
    return HttpResponse.json({ success: true })
  }),

  // Admin categories
  http.post('/api/admin/categories', async ({ request }) => {
    await delay(150)
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

  http.patch('/api/admin/categories/:id', async ({ params, request }) => {
    await delay(100)
    const { id } = params
    const cat = adminCategories.find((c) => c.id === id)
    if (!cat) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'التصنيف غير موجود' }, { status: 404 })
    }
    const body = (await request.json()) as Partial<typeof cat>
    Object.assign(cat, body)
    return HttpResponse.json(cat)
  }),

  http.delete('/api/admin/categories/:id', async ({ params }) => {
    await delay(150)
    const { id } = params
    const cat = adminCategories.find((c) => c.id === id)
    if (!cat) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'التصنيف غير موجود' }, { status: 404 })
    }

    // Check if category has products
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
    return HttpResponse.json({ success: true })
  }),

  // Admin users
  http.get('/api/admin/users', async () => {
    await delay(80)
    return HttpResponse.json(staffUsers)
  }),

  http.post('/api/admin/users', async ({ request }) => {
    await delay(150)
    const body = (await request.json()) as { username: string; name: string; role: 'orders_manager' }
    const newUser = {
      id: `usr-${Date.now()}`,
      username: body.username,
      name: body.name,
      role: body.role,
      disabled: false,
    }
    staffUsers.push(newUser)
    return HttpResponse.json(newUser, { status: 201 })
  }),

  http.patch('/api/admin/users/:id/disable', async ({ params }) => {
    await delay(100)
    const { id } = params
    const user = staffUsers.find((u) => u.id === id)
    if (user) {
      user.disabled = true
    }
    return HttpResponse.json({ success: true })
  }),
]
