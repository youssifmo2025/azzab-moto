import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { apiClient } from '@/services/api/client'
import { ApiClientError } from '@/services/api/schemas/error'
import type { User, LoginRequest, ChangePasswordRequest } from '@/services/api/schemas/auth'

interface AdminAuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (credentials: LoginRequest) => Promise<User>
  logout: () => Promise<void>
  changePassword: (data: ChangePasswordRequest) => Promise<void>
  refreshUser: () => Promise<User | null>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const res = await apiClient.get<User>('/api/auth/me')
      setUser(res)
      setError(null)
      return res
    } catch {
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (credentials: LoginRequest): Promise<User> => {
    setLoading(true)
    setError(null)
    try {
      // First ensure CSRF token is present
      await apiClient.fetchCsrfToken()
      const res = await apiClient.post<{ user: User }>('/api/auth/login', credentials)
      setUser(res.user)
      return res.user
    } catch (err) {
      let msg = 'تعذر تسجيل الدخول، يرجى المحاولة مجدداً'
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          msg = 'اسم المستخدم أو كلمة المرور غير صحيحة'
        } else if (err.status === 404) {
          msg = 'تعذر الاتصال بخدمة التحقق (404 غير موجود)'
        } else if (err.status === 429) {
          msg = err.message
        } else {
          msg = err.message || msg
        }
      }
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    setLoading(true)
    try {
      await apiClient.post('/api/auth/logout')
    } catch {
      // ignore
    } finally {
      setUser(null)
      setLoading(false)
    }
  }

  const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
    setLoading(true)
    try {
      await apiClient.post('/api/auth/change-password', data)
      if (user) {
        setUser({ ...user, mustChangePassword: false })
      }
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'تعذر تغيير كلمة المرور'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        changePassword,
        refreshUser,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

