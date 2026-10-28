import { http, HttpResponse, delay } from 'msw'
import { initialMockProducts, loadDemoOrders, saveDemoOrders, type MockOrder } from '../data/mock-data'
import type { CreateOrderRequest } from '@/services/api/schemas/order'

const orders: MockOrder[] = loadDemoOrders()
const seenIdempotencyKeys = new Set<string>()

export const orderHandlers = [
  http.post('/api/orders', async ({ request }) => {
    await delay(300)

    const idempotencyKey = request.headers.get('Idempotency-Key')
    if (idempotencyKey && seenIdempotencyKeys.has(idempotencyKey)) {
      // Find existing order for this key or return cached confirmation
      const existing = orders[0]
      if (existing) {
        return HttpResponse.json({
          orderNumber: existing.orderNumber,
          status: existing.status,
          total: existing.total,
          subtotal: existing.subtotal,
          shippingFee: existing.shippingFee,
          currency: 'EGP',
          items: existing.items,
          customer: existing.customer,
          createdAt: existing.createdAt,
        }, { status: 201 })
      }
    }

    if (idempotencyKey) {
      seenIdempotencyKeys.add(idempotencyKey)
    }

    let payload: CreateOrderRequest
    try {
      payload = (await request.json()) as CreateOrderRequest
    } catch {
      return HttpResponse.json(
        { code: 'INVALID_JSON', message: 'صيغة البيانات غير صحيحة' },
        { status: 400 },
      )
    }

    // Bot honeypot trap
    if (payload.honeypotField && payload.honeypotField.trim().length > 0) {
      return HttpResponse.json(
        { code: 'BOT_DETECTED', message: 'تم رفض الطلب' },
        { status: 400 },
      )
    }

    const { customer, items } = payload

    // Server-side validation
    const fieldErrors: Record<string, string[]> = {}
    if (!customer?.name || customer.name.length < 2) {
      fieldErrors['customer.name'] = ['الاسم يجب أن يحتوي على حرفين على الأقل']
    }
    if (!customer?.phone || !/^01[0125]\d{8}$/.test(customer.phone)) {
      fieldErrors['customer.phone'] = ['رقم الهاتف غير صحيح، يجب أن يكون 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015']
    }
    if (!customer?.governorate) {
      fieldErrors['customer.governorate'] = ['المحافظة مطلوبة']
    }
    if (!customer?.address || customer.address.length < 5) {
      fieldErrors['customer.address'] = ['العنوان بالتفصيل مطلوب']
    }
    if (!items || items.length === 0) {
      fieldErrors['items'] = ['يجب إضافة منتج واحد على الأقل']
    }

    if (Object.keys(fieldErrors).length > 0) {
      return HttpResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'بيانات الطلب غير مكتملة أو تحتوي على أخطاء',
          fieldErrors,
        },
        { status: 400 },
      )
    }

    // Inventory & price calculation
    let subtotalNum = 0
    const confirmedItems: Array<{
      productId: string
      sku: string
      productName: string
      price: string
      quantity: number
      total: string
    }> = []

    for (const item of items) {
      const product = initialMockProducts.find((p) => p.id === item.productId)
      if (!product) {
        return HttpResponse.json(
          { code: 'PRODUCT_NOT_FOUND', message: `المنتج غير موجود: ${item.productId}` },
          { status: 404 },
        )
      }

      if (product.availability === 'out_of_stock' || (product.stockQuantity !== null && product.stockQuantity < item.quantity)) {
        return HttpResponse.json(
          {
            code: 'OUT_OF_STOCK',
            message: `الكمية المطلوبة غير متوفرة حالياً لمنتج: ${product.name}`,
            fieldErrors: {
              [`items.${item.productId}`]: [`الكمية المتاحة: ${product.stockQuantity ?? 0}`],
            },
          },
          { status: 409 },
        )
      }

      const itemPriceNum = parseFloat(product.price)
      const lineTotalNum = itemPriceNum * item.quantity
      subtotalNum += lineTotalNum

      confirmedItems.push({
        productId: product.id,
        sku: product.sku,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
        total: lineTotalNum.toFixed(2),
      })
    }

    const shippingFee = '0.00'
    const total = (subtotalNum + parseFloat(shippingFee)).toFixed(2)
    const orderNumber = `AZ-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`
    const createdAt = new Date().toISOString()

    const newOrder: MockOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      status: 'new',
      total,
      subtotal: subtotalNum.toFixed(2),
      shippingFee,
      currency: 'EGP',
      items: confirmedItems,
      customer,
      createdAt,
      history: [
        {
          status: 'new',
          changedAt: createdAt,
          changedBy: 'Customer',
          note: 'إنشاء الطلب من المتجر الإلكتروني',
        },
      ],
    }

    orders.unshift(newOrder)
    saveDemoOrders(orders)

    return HttpResponse.json(
      {
        orderNumber: newOrder.orderNumber,
        status: newOrder.status,
        total: newOrder.total,
        subtotal: newOrder.subtotal,
        shippingFee: newOrder.shippingFee,
        currency: 'EGP',
        items: confirmedItems.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          price: i.price,
          quantity: i.quantity,
          total: i.total,
        })),
        customer: newOrder.customer,
        createdAt: newOrder.createdAt,
      },
      { status: 201 },
    )
  }),

  http.post('/api/orders/lookup', async ({ request }) => {
    await delay(200)
    let body: { orderNumber?: string; phone?: string }
    try {
      body = (await request.json()) as { orderNumber?: string; phone?: string }
    } catch {
      return HttpResponse.json(
        { code: 'BAD_REQUEST', message: 'صيغة الطلب غير صحيحة' },
        { status: 400 },
      )
    }

    const orderNumber = body.orderNumber?.trim().toUpperCase()
    const phone = body.phone?.trim()

    const found = orders.find(
      (o) => o.orderNumber.toUpperCase() === orderNumber && o.customer.phone === phone,
    )

    if (!found) {
      // Intentionally generic error to prevent enumeration
      return HttpResponse.json(
        {
          code: 'NOT_FOUND',
          message: 'رقم الطلب أو رقم الهاتف غير مطابق لبيانات مسجلة لدينا',
        },
        { status: 404 },
      )
    }

    return HttpResponse.json({
      orderNumber: found.orderNumber,
      status: found.status,
      createdAt: found.createdAt,
      statusUpdatedAt: found.history[found.history.length - 1]?.changedAt,
      total: found.total,
      itemsCount: found.items.reduce((sum, item) => sum + item.quantity, 0),
      governorate: found.customer.governorate,
    })
  }),
]

export { orders }

