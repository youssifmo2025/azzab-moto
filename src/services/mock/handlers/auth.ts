import { http, HttpResponse, delay } from 'msw'
import type { LoginRequest, ChangePasswordRequest, User } from '@/services/api/schemas/auth'

let currentUser: User | null = {
  id: 'usr-1',
  username: 'admin',
  name: 'مدير النظام',
  role: 'admin',
  disabled: false,
  mustChangePassword: false,
}

export const authHandlers = [
  http.get('/api/auth/csrf-token', async () => {
    return HttpResponse.json(
      { csrfToken: 'mock-csrf-token-xyz' },
      {
        headers: {
          'Set-Cookie': 'csrfToken=mock-csrf-token-xyz; Path=/; SameSite=Lax',
        },
      },
    )
  }),

  http.post('/api/auth/login', async ({ request }) => {
    await delay(250)
    let body: LoginRequest
    try {
      body = (await request.json()) as LoginRequest
    } catch {
      return HttpResponse.json({ code: 'BAD_REQUEST', message: 'بيانات غير صحيحة' }, { status: 400 })
    }

    if (body.username === 'rate_limited') {
      return HttpResponse.json(
        { code: 'RATE_LIMITED', message: 'تم تجاوز عدد محاولات الدخول، يرجى المحاولة بعد 15 دقيقة' },
        { status: 429, headers: { 'Retry-After': '900' } },
      )
    }

    if (body.username === 'admin' && body.password === 'admin12345') {
      currentUser = {
        id: 'usr-1',
        username: 'admin',
        name: 'مدير النظام',
        role: 'admin',
        disabled: false,
        mustChangePassword: false,
      }
      return HttpResponse.json(
        { user: currentUser },
        {
          headers: {
            'Set-Cookie': 'session_id=mock-session-admin; HttpOnly; Path=/; SameSite=Lax',
          },
        },
      )
    }

    if (body.username === 'manager' && body.password === 'manager12345') {
      currentUser = {
        id: 'usr-2',
        username: 'manager',
        name: 'مسؤول الطلبات',
        role: 'orders_manager',
        disabled: false,
        mustChangePassword: false,
      }
      return HttpResponse.json(
        { user: currentUser },
        {
          headers: {
            'Set-Cookie': 'session_id=mock-session-manager; HttpOnly; Path=/; SameSite=Lax',
          },
        },
      )
    }

    if (body.username === 'forced_user' && body.password === 'temp12345') {
      currentUser = {
        id: 'usr-3',
        username: 'forced_user',
        name: 'موظف تجريبي',
        role: 'orders_manager',
        disabled: false,
        mustChangePassword: true,
      }
      return HttpResponse.json(
        { user: currentUser },
        {
          headers: {
            'Set-Cookie': 'session_id=mock-session-forced; HttpOnly; Path=/; SameSite=Lax',
          },
        },
      )
    }

    return HttpResponse.json(
      { code: 'INVALID_CREDENTIALS', message: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
      { status: 401 },
    )
  }),

  http.post('/api/auth/logout', async () => {
    await delay(100)
    currentUser = null
    return HttpResponse.json(
      { success: true },
      {
        headers: {
          'Set-Cookie': 'session_id=; HttpOnly; Path=/; Max-Age=0',
        },
      },
    )
  }),

  http.get('/api/auth/me', async () => {
    await delay(100)
    if (!currentUser) {
      return HttpResponse.json(
        { code: 'UNAUTHENTICATED', message: 'انتهت الجلسة، يرجى تسجيل الدخول' },
        { status: 401 },
      )
    }
    return HttpResponse.json(currentUser)
  }),

  http.post('/api/auth/change-password', async ({ request }) => {
    await delay(200)
    if (!currentUser) {
      return HttpResponse.json({ code: 'UNAUTHENTICATED', message: 'يرجى تسجيل الدخول' }, { status: 401 })
    }

    const body = (await request.json()) as ChangePasswordRequest
    if (body.currentPassword.length < 5) {
      return HttpResponse.json(
        { code: 'INVALID_PASSWORD', message: 'كلمة المرور الحالية غير صحيحة' },
        { status: 400 },
      )
    }

    currentUser.mustChangePassword = false

    return HttpResponse.json({ success: true, message: 'تم تحديث كلمة المرور بنجاح' })
  }),
]

export function getCurrentUser(): User | null {
  return currentUser
}

export function setMockUser(user: User | null) {
  currentUser = user
}
