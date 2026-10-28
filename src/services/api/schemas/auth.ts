import { z } from 'zod'

export const UserRoleEnum = z.enum(['admin', 'orders_manager'])

export type UserRole = z.infer<typeof UserRoleEnum>

export const UserSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(3),
  name: z.string().min(2),
  role: UserRoleEnum,
  disabled: z.boolean().optional().default(false),
  mustChangePassword: z.boolean().optional().default(false),
})

export type User = z.infer<typeof UserSchema>

export const LoginRequestSchema = z.object({
  username: z.string().min(1, 'اسم المستخدم مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>

export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: z.string().min(8, 'كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف'),
})

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>

export const AuthSessionSchema = z.object({
  user: UserSchema,
})

export type AuthSession = z.infer<typeof AuthSessionSchema>

export const AdminResetPasswordResponseSchema = z.object({
  success: z.literal(true),
  temporaryPassword: z.string().min(8),
  message: z.string(),
})

export type AdminResetPasswordResponse = z.infer<typeof AdminResetPasswordResponseSchema>
