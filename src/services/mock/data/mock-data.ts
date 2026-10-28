import rawProducts from '@/data/products.json'
import rawCategories from '@/data/categories.json'
import rawModels from '@/data/models.json'

export interface MockProduct {
  id: string
  slug: string
  name: string
  nameEn: string
  sku: string
  partNumber: string
  categoryId: string
  price: string
  currency: 'EGP'
  availability: 'in_stock' | 'out_of_stock' | 'order_only'
  stockQuantity: number | null
  images: string[]
  description: string
  compatibility: Array<{
    modelId: string
    yearFrom: number
    yearTo: number
  }>
}

export const initialMockProducts: MockProduct[] = rawProducts.map((p, index) => ({
  ...p,
  availability: p.availability as 'in_stock' | 'out_of_stock' | 'order_only',
  price: Number(p.price).toFixed(2),
  stockQuantity: index % 5 === 0 ? 3 : index % 7 === 0 ? null : 15, // Some low stock, some untracked, most plentiful
  currency: 'EGP' as const,
}))

export const mockCategories = [...rawCategories]

export const mockModels = [...rawModels]

export interface MockOrder {
  id: string
  orderNumber: string
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: string
  subtotal: string
  shippingFee: string
  currency: 'EGP'
  items: Array<{
    productId: string
    sku: string
    productName: string
    price: string
    quantity: number
    total: string
  }>
  customer: {
    name: string
    phone: string
    governorate: string
    city: string
    address: string
    notes?: string
  }
  internalNotes?: string
  createdAt: string
  history: Array<{
    status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    changedAt: string
    changedBy: string
    note?: string
  }>
}

export const initialMockOrders: MockOrder[] = [
  {
    id: 'ord-101',
    orderNumber: 'AZ-202610-1001',
    status: 'new',
    total: '760.00',
    subtotal: '760.00',
    shippingFee: '0.00',
    currency: 'EGP',
    items: [
      {
        productId: rawProducts[0]?.id ?? 'prod-1',
        sku: rawProducts[0]?.sku ?? 'TVS-BRK-001',
        productName: rawProducts[0]?.name ?? 'تيل فرامل أمامي أباتشي',
        price: '380.00',
        quantity: 2,
        total: '760.00',
      },
    ],
    customer: {
      name: 'أحمد محمد علي',
      phone: '01012345678',
      governorate: 'القاهرة',
      city: 'مدينة نصر',
      address: 'شارع الطيران، عمارة 15',
      notes: 'الاتصال قبل التوصيل',
    },
    internalNotes: 'عميل جديد',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    history: [
      {
        status: 'new',
        changedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        changedBy: 'Customer',
        note: 'تم استلام الطلب من المتجر الإلكتروني',
      },
    ],
  },
  {
    id: 'ord-102',
    orderNumber: 'AZ-202610-1002',
    status: 'processing',
    total: '450.00',
    subtotal: '450.00',
    shippingFee: '0.00',
    currency: 'EGP',
    items: [
      {
        productId: rawProducts[1]?.id ?? 'prod-2',
        sku: rawProducts[1]?.sku ?? 'TVS-FLT-002',
        productName: rawProducts[1]?.name ?? 'فلتر زيت أصلي TVS',
        price: '450.00',
        quantity: 1,
        total: '450.00',
      },
    ],
    customer: {
      name: 'محمود حسن إبراهيم',
      phone: '01198765432',
      governorate: 'الجيزة',
      city: 'الدقي',
      address: 'شارع مصدق، بجوار محطة المترو',
    },
    internalNotes: 'تم التأكيد هاتفياً',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    history: [
      {
        status: 'new',
        changedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        changedBy: 'Customer',
        note: 'إنشاء الطلب',
      },
      {
        status: 'processing',
        changedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
        changedBy: 'مدير النظام',
        note: 'تم التواصل وتأكيد التجهيز',
      },
    ],
  },
  {
    id: 'ord-103',
    orderNumber: 'AZ-202610-1003',
    status: 'shipped',
    total: '1200.00',
    subtotal: '1200.00',
    shippingFee: '0.00',
    currency: 'EGP',
    items: [
      {
        productId: rawProducts[2]?.id ?? 'prod-3',
        sku: rawProducts[2]?.sku ?? 'TVS-CLU-003',
        productName: rawProducts[2]?.name ?? 'طقم دبرياج كامل',
        price: '1200.00',
        quantity: 1,
        total: '1200.00',
      },
    ],
    customer: {
      name: 'كريم عادل',
      phone: '01234567890',
      governorate: 'الإسكندرية',
      city: 'سموحة',
      address: 'أمام نادي سموحة',
    },
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    history: [
      {
        status: 'new',
        changedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
        changedBy: 'Customer',
      },
      {
        status: 'processing',
        changedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
        changedBy: 'مدير النظام',
      },
      {
        status: 'shipped',
        changedAt: new Date(Date.now() - 3600000 * 15).toISOString(),
        changedBy: 'مسؤول الطلبات',
        note: 'تم التسليم لشركة الشحن (بوليصة 987654)',
      },
    ],
  },
]

const DEMO_ORDERS_KEY = 'am_demo_orders_v1'
const DEMO_PRODUCTS_KEY = 'am_demo_products_v1'

export function loadDemoOrders(): MockOrder[] {
  if (typeof window === 'undefined') return [...initialMockOrders]
  try {
    const raw = localStorage.getItem(DEMO_ORDERS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return [...initialMockOrders]
}

export function saveDemoOrders(ordersList: MockOrder[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify(ordersList))
  } catch {
    // ignore
  }
}

export function loadDemoProducts(): MockProduct[] {
  if (typeof window === 'undefined') return [...initialMockProducts]
  try {
    const raw = localStorage.getItem(DEMO_PRODUCTS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return [...initialMockProducts]
}

export function saveDemoProducts(productsList: MockProduct[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DEMO_PRODUCTS_KEY, JSON.stringify(productsList))
  } catch {
    // ignore
  }
}

export function resetDemoData(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(DEMO_ORDERS_KEY)
    localStorage.removeItem(DEMO_PRODUCTS_KEY)
    window.location.reload()
  } catch {
    // ignore
  }
}
