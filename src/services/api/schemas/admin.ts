import { z } from 'zod'
import { OrderStatusEnum, MoneyStringSchema, EgyptianPhoneSchema } from './order'
import { UserRoleEnum, UserSchema } from './auth'
import { CompatibilitySchema } from '@/services/schemas/product'
import { PaginationMetaSchema } from './pagination'

export const AdminDashboardSummarySchema = z.object({
  todayOrdersCount: z.number().int().nonnegative(),
  todayOrdersTotal: MoneyStringSchema,
  pendingOrdersCount: z.number().int().nonnegative(),
  lowStockCount: z.number().int().nonnegative(),
  statusCounts: z.object({
    new: z.number().int().nonnegative(),
    processing: z.number().int().nonnegative(),
    shipped: z.number().int().nonnegative(),
    delivered: z.number().int().nonnegative(),
    cancelled: z.number().int().nonnegative(),
  }),
})

export type AdminDashboardSummary = z.infer<typeof AdminDashboardSummarySchema>

export const AdminOrderSummarySchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  customerName: z.string(),
  phone: EgyptianPhoneSchema,
  governorate: z.string(),
  status: OrderStatusEnum,
  total: MoneyStringSchema,
  itemsCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
})

export type AdminOrderSummary = z.infer<typeof AdminOrderSummarySchema>

export const PaginatedAdminOrdersSchema = z.object({
  data: z.array(AdminOrderSummarySchema),
  meta: PaginationMetaSchema,
})

export type PaginatedAdminOrders = z.infer<typeof PaginatedAdminOrdersSchema>

export const CreateProductInputSchema = z.object({
  name: z.string().min(1, 'اسم القطعة بالعربية مطلوب'),
  nameEn: z.string().min(1, 'اسم القطعة بالإنجليزية مطلوب'),
  sku: z.string().min(1, 'رمز التخزين SKU مطلوب'),
  partNumber: z.string().optional().default(''),
  categoryId: z.string().min(1, 'التصنيف مطلوب'),
  price: MoneyStringSchema,
  availability: z.enum(['in_stock', 'out_of_stock', 'order_only']),
  stockQuantity: z.number().int().nonnegative().nullable().optional(),
  images: z.array(z.string()).min(1, 'يجب رفع صورة واحدة على الأقل'),
  description: z.string().max(2000),
  compatibility: z.array(CompatibilitySchema).default([]),
  isActive: z.boolean().optional().default(true),
})

export type CreateProductInput = z.infer<typeof CreateProductInputSchema>

export const UpdateProductInputSchema = CreateProductInputSchema.partial()

export type UpdateProductInput = z.infer<typeof UpdateProductInputSchema>

export const ReorderImagesRequestSchema = z.object({
  images: z.array(z.string()).min(1, 'يجب تحديد ترتيب الصور (الصورة الأولى تعتبر الأساسية)'),
})

export type ReorderImagesRequest = z.infer<typeof ReorderImagesRequestSchema>

export const CreateCategoryInputSchema = z.object({
  name: z.string().min(1, 'اسم التصنيف مطلوب'),
  slug: z.string().min(1, 'الاسم اللطيف (slug) مطلوب').regex(/^[a-z0-9-]+$/),
  icon: z.string().min(1, 'أيقونة التصنيف مطلوبة'),
  description: z.string().max(500).optional(),
})

export type CreateCategoryInput = z.infer<typeof CreateCategoryInputSchema>

export const UpdateCategoryInputSchema = CreateCategoryInputSchema.partial()

export type UpdateCategoryInput = z.infer<typeof UpdateCategoryInputSchema>

export const ReorderCategoriesRequestSchema = z.object({
  categoryIds: z.array(z.string()).min(1, 'يجب تحديد ترتيب التصنيفات'),
})

export type ReorderCategoriesRequest = z.infer<typeof ReorderCategoriesRequestSchema>

export const CreateUserInputSchema = z.object({
  username: z.string().min(3, 'اسم المستخدم يجب ألا يقل عن 3 أحرف'),
  name: z.string().min(2, 'الاسم الكامل مطلوب'),
  password: z.string().min(8, 'كلمة المرور المؤقتة يجب ألا تقل عن 8 أحرف').optional(),
  role: UserRoleEnum,
})

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>

export const CreateUserResponseSchema = z.object({
  user: UserSchema,
  temporaryPassword: z.string().min(8),
})

export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>
