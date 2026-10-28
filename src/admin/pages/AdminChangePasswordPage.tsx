import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAdminAuth } from '../context/AdminAuthContext'
import { KeyRound, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react'

export default function AdminChangePasswordPage() {
  const { user, changePassword } = useAdminAuth()
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword.length < 8) {
      setError('كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('كلمة المرور وتأكيدها غير متطابقين')
      return
    }

    setIsSubmitting(true)
    try {
      await changePassword({ currentPassword, newPassword })
      setSuccess('تم تغيير كلمة المرور بنجاح! جارٍ تحويلك للوحة التحكم...')
      setTimeout(() => {
        navigate('/admin', { replace: true })
      }, 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'تعذر تغيير كلمة المرور')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-6" dir="rtl">
      <Helmet>
        <title>تغيير كلمة المرور — عزاب موتو</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {user?.mustChangePassword && (
        <div className="mb-6 p-4 rounded-[10px] bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-bold">تنبيه أمني إلزامي</h2>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              تم إنشاء حسابك بكلمة مرور مؤقتة، يجب عليك تعيين كلمة مرور جديدة قوية وخاصة بك للمتابعة إلى النظام.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[10px] border border-[#ECE6DD] p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-5 border-b border-[#ECE6DD] pb-4">
          <div className="p-2 rounded-lg bg-amber-50 text-accent">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-tajawal text-text-primary">تغيير كلمة المرور</h1>
            <p className="text-xs text-text-secondary">قم بتعيين كلمة مرور جديدة لا تقل عن 8 أحرف</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-[10px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1" htmlFor="current-pw">
              كلمة المرور الحالية (أو المؤقتة)
            </label>
            <input
              id="current-pw"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border border-[#ECE6DD] text-sm focus:outline-hidden focus:border-accent"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1" htmlFor="new-pw">
              كلمة المرور الجديدة
            </label>
            <input
              id="new-pw"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border border-[#ECE6DD] text-sm focus:outline-hidden focus:border-accent"
              placeholder="8 أحرف على الأقل"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1" htmlFor="confirm-pw">
              تأكيد كلمة المرور الجديدة
            </label>
            <input
              id="confirm-pw"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border border-[#ECE6DD] text-sm focus:outline-hidden focus:border-accent"
              required
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-[10px] bg-accent text-white font-bold text-sm hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'جارٍ الحفظ...' : 'حفظ كلمة المرور الجديدة'}
          </button>
        </form>
      </div>
    </div>
  )
}

