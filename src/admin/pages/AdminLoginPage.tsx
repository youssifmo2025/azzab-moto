import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAdminAuth } from '../context/AdminAuthContext'
import { Lock, User as UserIcon, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import logoImg from '@/assets/logo.png'

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
    <div
      className="relative min-h-screen bg-base flex flex-col justify-between overflow-hidden text-heading"
      dir="rtl"
    >
      <Helmet>
        <title>تسجيل دخول الإدارة — عزاب موتو</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Procedural Brand Background Art (Warm ambient lighting & faint brand watermark) */}
      <div
        className="pointer-events-none absolute inset-0 select-none overflow-hidden"
        aria-hidden="true"
      >
        {/* Soft radial ambient warm spotlight at top center */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,130,0,0.06)_0%,rgba(246,241,234,0.5)_50%,transparent_75%)] blur-3xl" />

        {/* Faint, cropped, partially off-canvas brand logo watermark (4.5% opacity, corner only) */}
        <img
          src={logoImg}
          alt=""
          className="absolute -bottom-20 -end-20 h-80 w-80 object-contain opacity-[0.045] grayscale invert pointer-events-none select-none"
        />

        {/* Faint procedural engineering arc contour (rotor-inspired) */}
        <svg
          className="absolute -top-24 -start-24 h-96 w-96 text-heading opacity-[0.035]"
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 8" />
          <circle cx="200" cy="200" r="130" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      {/* ── Top Header Navigation Bar with "Back to Website" Control ──────── */}
      <header className="relative z-20 w-full border-b border-border/60 bg-surface/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Back to website control (top-right in RTL, with RTL-aware arrow and 44px touch target) */}
          <Link
            to="/"
            className="text-btn text-btn-default focus-visible:outline-accent py-2 px-1 text-sm font-semibold"
            aria-label="العودة إلى المتجر الرئيسي عزاب موتو"
          >
            <ArrowRight className="h-4 w-4 text-btn-arrow text-btn-arrow-back text-secondary" aria-hidden="true" />
            <span>العودة إلى المتجر</span>
          </Link>

          {/* Azab Moto Logo linking to home */}
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-[8px] p-1 transition hover:opacity-90 focus-visible:outline-accent"
            aria-label="عزاب موتو — الصفحة الرئيسية"
          >
            <span className="font-heading text-sm font-bold text-heading hidden sm:inline">
              عزاب موتو
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-black p-1 shadow-2xs">
              <img src={logoImg} alt="شعار عزاب موتو" className="h-full w-full object-contain" />
            </div>
          </Link>
        </div>
      </header>

      {/* ── Main Login Form Card ────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md rounded-[14px] border border-border bg-surface p-6 shadow-md sm:p-8 backdrop-blur-xs">
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-promo text-accent mb-3 border border-accent/25 shadow-2xs">
              <Lock className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="font-heading text-2xl font-extrabold text-heading">
              تسجيل دخول الإدارة
            </h1>
            <p className="mt-1 text-sm text-body">
              بوابة إدارة متجر عزاب موتو لقطع غيار TVS
            </p>
          </div>

          {(localError || error) && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-[10px] border border-red-200 bg-red-50 p-3 text-sm text-red-700 animate-fade-in"
            >
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
              <span>{localError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold text-heading"
                htmlFor="admin-username"
              >
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
                  className="w-full rounded-[10px] border border-border bg-base px-3.5 py-2.5 pe-10 text-sm text-heading transition focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  disabled={isSubmitting}
                  required
                />
                <UserIcon
                  className="pointer-events-none absolute end-3 top-3 h-4 w-4 text-secondary"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-semibold text-heading"
                htmlFor="admin-password"
              >
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
                  className="w-full rounded-[10px] border border-border bg-base px-3.5 py-2.5 pe-10 text-sm text-heading transition focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  disabled={isSubmitting}
                  required
                />
                <Lock
                  className="pointer-events-none absolute end-3 top-3 h-4 w-4 text-secondary"
                  aria-hidden="true"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-press mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-accent px-4 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>الدخول إلى النظام</span>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* Demo Fast Login Pills */}
          <div className="mt-8 border-t border-border pt-5">
            <p className="mb-2 text-center text-xs font-semibold text-secondary">
              بيانات تجريبية سريعة:
            </p>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => fillCredentials('admin', 'admin12345')}
                className="btn-press flex items-center justify-between rounded-[8px] border border-border/80 bg-alt px-3 py-2 text-end text-xs text-heading transition hover:border-accent/40 hover:bg-promo"
              >
                <span>دخول كـ <strong>مدير النظام (Admin)</strong></span>
                <span className="font-numeric tabular text-[11px] text-secondary">admin / admin12345</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('manager', 'manager12345')}
                className="btn-press flex items-center justify-between rounded-[8px] border border-border/80 bg-alt px-3 py-2 text-end text-xs text-heading transition hover:border-accent/40 hover:bg-promo"
              >
                <span>دخول كـ <strong>مسؤول طلبات (Orders Manager)</strong></span>
                <span className="font-numeric tabular text-[11px] text-secondary">manager / manager12345</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('forced_user', 'temp12345')}
                className="btn-press flex items-center justify-between rounded-[8px] border border-amber-200 bg-amber-50 px-3 py-2 text-end text-xs text-amber-900 transition hover:bg-amber-100"
              >
                <span>تجربة <strong>كلمة مرور مؤقتة إجبارية</strong></span>
                <span className="font-numeric tabular text-[11px] text-amber-700">forced_user / temp12345</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ── Minimalist Brand Footer on Auth Page ────────────────────────── */}
      <footer className="relative z-10 py-4 text-center text-xs text-secondary border-t border-border/40">
        <p>© {new Date().getFullYear()} عزاب موتو — الموزع المعتمد لقطع غيار TVS في مصر</p>
      </footer>
    </div>
  )
}
