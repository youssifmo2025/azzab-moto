import { z } from 'zod'

export const OrderStatusEnum = z.enum([
  'new',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
])

export type OrderStatus = z.infer<typeof OrderStatusEnum>

export const MoneyStringSchema = z
  .string()
  .regex(/^\d+\.\d{2}$/, 'Money amount must be formatted as 2-decimal string (e.g. 380.00)')

export const EgyptianPhoneSchema = z
  .string()
  .regex(/^01[0125]\d{8}$/, 'رقم الهاتف يجب أن يكون رقم محمول مصري مكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015')

export const OrderCustomerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يحتوي على حرفين على الأقل').max(100),
  phone: EgyptianPhoneSchema,
  governorate: z.string().min(2, 'المحافظة مطلوبة'),
  city: z.string().min(2, 'المدينة / المركز مطلوب'),
  address: z.string().min(5, 'العنوان بالتفصيل مطلوب').max(300),
  notes: z.string().max(500).optional(),
})

export type OrderCustomer = z.infer<typeof OrderCustomerSchema>

export const OrderItemInputSchema = z.object({
  productId: z.string().min(1, 'معرّف المنتج مطلوب'),
  quantity: z.number().int().min(1, 'الكمية يجب أن تكون 1 على الأقل'),
})

export type OrderItemInput = z.infer<typeof OrderItemInputSchema>

export const CreateOrderRequestSchema = z.object({
  customer: OrderCustomerSchema,
  items: z.array(OrderItemInputSchema).min(1, 'يجب إضافة منتج واحد على الأقل للطلب'),
  honeypotField: z.string().optional(),
})

export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>

export const OrderConfirmationItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  price: MoneyStringSchema,
  quantity: z.number().int().positive(),
  total: MoneyStringSchema,
})

export type OrderConfirmationItem = z.infer<typeof OrderConfirmationItemSchema>

export const OrderConfirmationSchema = z.object({
  orderNumber: z.string(),
  status: OrderStatusEnum,
  total: MoneyStringSchema,
  subtotal: MoneyStringSchema,
  shippingFee: MoneyStringSchema,
  currency: z.literal('EGP').default('EGP'),
  items: z.array(OrderConfirmationItemSchema),
  customer: OrderCustomerSchema,
  createdAt: z.string().datetime(),
})

export type OrderConfirmation = z.infer<typeof OrderConfirmationSchema>

export const OrderLookupRequestSchema = z.object({
  orderNumber: z.string().min(1, 'رقم الطلب مطلوب'),
  phone: EgyptianPhoneSchema,
})

export type OrderLookupRequest = z.infer<typeof OrderLookupRequestSchema>

export const OrderLookupResultSchema = z.object({
  orderNumber: z.string(),
  status: OrderStatusEnum,
  createdAt: z.string().datetime(),
  statusUpdatedAt: z.string().datetime().optional(),
  total: MoneyStringSchema,
  itemsCount: z.number().int().nonnegative(),
  governorate: z.string(),
})

export type OrderLookupResult = z.infer<typeof OrderLookupResultSchema>

export const OrderStatusHistoryItemSchema = z.object({
  status: OrderStatusEnum,
  changedAt: z.string().datetime(),
  changedBy: z.string(),
  note: z.string().optional(),
})

export type OrderStatusHistoryItem = z.infer<typeof OrderStatusHistoryItemSchema>

export const AdminOrderItemSchema = z.object({
  productId: z.string(),
  sku: z.string(),
  productName: z.string(),
  price: MoneyStringSchema,
  quantity: z.number().int().positive(),
  total: MoneyStringSchema,
})

export type AdminOrderItem = z.infer<typeof AdminOrderItemSchema>

export const AdminOrderDetailSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  status: OrderStatusEnum,
  customer: OrderCustomerSchema,
  items: z.array(AdminOrderItemSchema),
  subtotal: MoneyStringSchema,
  shippingFee: MoneyStringSchema,
  total: MoneyStringSchema,
  internalNotes: z.string().optional(),
  createdAt: z.string().datetime(),
  history: z.array(OrderStatusHistoryItemSchema),
})

export type AdminOrderDetail = z.infer<typeof AdminOrderDetailSchema>
