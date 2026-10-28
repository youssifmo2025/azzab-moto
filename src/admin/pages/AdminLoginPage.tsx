import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAdminAuth } from '../context/AdminAuthContext'
import { Lock, User as UserIcon, AlertCircle, ArrowLeft } from 'lucide-react'

export default function AdminLoginPage() {
  const { login, error } = useAdminAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setLocalError('يرجى ملء اسم المستخدم وكلمة المرور')
      return
    }

    setIsSubmitting(true)
    setLocalError(null)

    try {
      const user = await login({ username: username.trim(), password })
      if (user.mustChangePassword) {
        navigate('/admin/change-password', { replace: true })
      } else {
        navigate('/admin', { replace: true })
      }
    } catch {
      // handled by context error
    } finally {
      setIsSubmitting(false)
    }
  }

  const fillCredentials = (u: string, p: string) => {
    setUsername(u)
    setPassword(p)
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-4 text-text-primary" dir="rtl">
      <Helmet>
        <title>تسجيل دخول الإدارة — عزاب موتو</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="w-full max-w-md bg-white rounded-[10px] border border-[#ECE6DD] shadow-xs p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-accent mb-3 border border-amber-200">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold font-tajawal text-text-primary">تسجيل دخول الإدارة</h1>
          <p className="text-sm text-text-secondary mt-1">بوابة إدارة متجر عزاب موتو لقطع غيار TVS</p>
        </div>

        {(localError || error) && (
          <div className="mb-5 p-3 rounded-[10px] bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5" htmlFor="admin-username">
              اسم المستخدم
            </label>
            <div className="relative">
              <input
                id="admin-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-3.5 py-2.5 pr-10 rounded-[10px] border border-[#ECE6DD] bg-white text-sm focus:outline-hidden focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                disabled={isSubmitting}
                required
              />
              <UserIcon className="w-5 h-5 text-text-secondary absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5" htmlFor="admin-password">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 pr-10 rounded-[10px] border border-[#ECE6DD] bg-white text-sm focus:outline-hidden focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                disabled={isSubmitting}
                required
              />
              <Lock className="w-5 h-5 text-text-secondary absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-[10px] bg-accent text-white font-bold text-sm hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>الدخول إلى النظام</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Pills */}
        <div className="mt-8 pt-5 border-t border-[#ECE6DD]">
          <p className="text-xs font-semibold text-text-secondary mb-2 text-center">بيانات تجريبية سريعة:</p>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => fillCredentials('admin', 'admin12345')}
              className="text-xs py-1.5 px-2.5 rounded-lg bg-[#F6F1EA] hover:bg-[#ECE6DD] text-text-primary text-right flex items-center justify-between"
            >
              <span>دخول كـ <strong>مدير النظام (Admin)</strong></span>
              <span className="text-[11px] text-text-secondary font-mono">admin / admin12345</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('manager', 'manager12345')}
              className="text-xs py-1.5 px-2.5 rounded-lg bg-[#F6F1EA] hover:bg-[#ECE6DD] text-text-primary text-right flex items-center justify-between"
            >
              <span>دخول كـ <strong>مسؤول طلبات (Orders Manager)</strong></span>
              <span className="text-[11px] text-text-secondary font-mono">manager / manager12345</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('forced_user', 'temp12345')}
              className="text-xs py-1.5 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-right flex items-center justify-between"
            >
              <span>تجربة <strong>كلمة مرور مؤقتة إجبارية</strong></span>
              <span className="text-[11px] text-amber-700 font-mono">forced_user / temp12345</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

