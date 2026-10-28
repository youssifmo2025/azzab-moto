import { useEffect, useState, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { apiClient } from '@/services/api/client'
import type { User } from '@/services/api/schemas/auth'
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  Copy,
  Check,
  X,
  AlertCircle,
} from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Create User Modal
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'orders_manager'>('orders_manager')
  const [submitting, setSubmitting] = useState(false)

  // Show Temp Password Modal (Shown ONCE, never logged)
  const [tempPasswordModal, setTempPasswordModal] = useState<{
    username: string
    password: string
    title: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await apiClient.get<User[]>('/api/admin/users')
      setUsers(res)
      setError(null)
    } catch {
      setError('تعذر تحميل قائمة الموظفين')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await apiClient.post<{ user: User; temporaryPassword: string }>('/api/admin/users', {
        username: username.trim(),
        name: name.trim(),
        role,
      })
      setCreateModalOpen(false)
      setUsername('')
      setName('')
      fetchUsers()
      // Open the once-only temporary password modal
      setTempPasswordModal({
        username: res.user.username,
        password: res.temporaryPassword,
        title: 'تم إنشاء حساب الموظف بنجاح',
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'تعذر إنشاء الحساب')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleDisable = async (u: User) => {
    const isDisabling = !u.disabled
    const promptMsg = isDisabling
      ? `هل أنت متأكد من تعطيل حساب "${u.name}" ومنعه من تسجيل الدخول؟`
      : `هل أنت متأكد من إعادة تفعيل حساب "${u.name}"؟`

    if (!window.confirm(promptMsg)) return

    try {
      if (isDisabling) {
        await apiClient.patch(`/api/admin/users/${u.id}/disable`)
      } else {
        await apiClient.patch(`/api/admin/users/${u.id}/enable`)
      }
      setSuccess(`تم ${isDisabling ? 'تعطيل' : 'تفعيل'} الحساب بنجاح`)
      fetchUsers()
    } catch {
      setError('تعذر تحديث حالة الحساب')
    }
  }

  const handleResetPassword = async (u: User) => {
    if (!window.confirm(`هل تريد إعادة تعيين كلمة المرور لحساب "${u.name}"؟ سيتم توليد كلمة مرور مؤقتة.`)) return

    try {
      const res = await apiClient.post<{ success: boolean; temporaryPassword: string; message: string }>(
        `/api/admin/users/${u.id}/reset-password`,
      )
      fetchUsers()
      setTempPasswordModal({
        username: u.username,
        password: res.temporaryPassword,
        title: `تم إعادة تعيين كلمة المرور لحساب ${u.name}`,
      })
    } catch {
      setError('تعذر إعادة تعيين كلمة المرور')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Helmet>
        <title>إدارة الطاقم والمستخدمين — عزاب موتو</title>
      </Helmet>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECE6DD] pb-4">
        <div>
          <h1 className="text-2xl font-black font-tajawal text-text-primary">إدارة طاقم العمل والمشرفين</h1>
          <p className="text-xs text-text-secondary mt-1">
            صلاحيات الوصول، تعيين وتجميد الحسابات، وتوليد كلمات المرور المؤقتة
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="py-2.5 px-4 rounded-[10px] bg-accent text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-95 transition-opacity cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة مسؤول طلبات جديد</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[10px] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-[10px] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-[10px] border border-[#ECE6DD] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#F6F1EA] border-b border-[#ECE6DD] text-text-secondary font-bold">
              <tr>
                <th className="py-3 px-4">اسم المستخدم</th>
                <th className="py-3 px-4">الاسم الكامل</th>
                <th className="py-3 px-4">الدور / الصلاحية</th>
                <th className="py-3 px-4">حالة الحساب</th>
                <th className="py-3 px-4">حالة كلمة المرور</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE6DD]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-secondary">
                    جارٍ تحميل بيانات الطاقم...
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSuper = u.role === 'admin'
                  return (
                    <tr key={u.id} className="hover:bg-[#FFFDF9] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-text-primary flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent" />
                        <span>{u.username}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-text-primary">{u.name}</td>
                      <td className="py-3 px-4">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>مدير النظام (Admin)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>مسؤول طلبات (Orders Manager)</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {u.disabled ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800">
                            معطل
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            نشط
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {u.mustChangePassword ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            مؤقتة (يلزم تغييرها)
                          </span>
                        ) : (
                          <span className="text-text-secondary">معينة</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {!isSuper ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleResetPassword(u)}
                              className="py-1 px-2.5 rounded-lg border border-[#ECE6DD] bg-[#F6F1EA] hover:bg-[#ECE6DD] text-text-primary font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              title="إعادة تعيين كلمة المرور"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-accent" />
                              <span>كلمة سر جديدة</span>
                            </button>
                            <button
                              onClick={() => handleToggleDisable(u)}
                              className={`py-1 px-2 rounded-lg border text-[11px] font-bold cursor-pointer ${
                                u.disabled
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                              }`}
                            >
                              {u.disabled ? 'تفعيل' : 'تعطيل'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-text-secondary text-[11px] italic">الحساب الأساسي</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-[10px] border border-[#ECE6DD] shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ECE6DD] pb-3">
              <h3 className="font-bold font-tajawal text-text-primary">إضافة مسؤول طلبات جديد</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-text-secondary hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-text-secondary mb-1">اسم المستخدم (Username) *</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-[8px] border border-[#ECE6DD] text-xs font-mono focus:outline-hidden focus:border-accent"
                  placeholder="e.g. ahmed_orders"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-text-secondary mb-1">الاسم الكامل للموظف *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-[8px] border border-[#ECE6DD] text-xs focus:outline-hidden focus:border-accent"
                  placeholder="e.g. أحمد مصطفى"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-text-secondary mb-1">الدور والصلاحية</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'orders_manager')}
                  className="w-full px-3 py-2 rounded-[8px] border border-[#ECE6DD] text-xs bg-white focus:outline-hidden focus:border-accent"
                >
                  <option value="orders_manager">مسؤول طلبات (متابعة الطلبات وتحديث الحالات والاطلاع على المخزون)</option>
                </select>
              </div>

              <div className="p-3 bg-[#F6F1EA] rounded-[8px] border border-[#ECE6DD] text-text-secondary text-[11px] leading-relaxed">
                سيقوم النظام تلقائياً بتوليد كلمة مرور مؤقتة وتفعيل خيار الإجبار على تغييرها عند أول تسجيل دخول.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#ECE6DD]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="py-2 px-4 rounded-[8px] border border-[#ECE6DD] bg-white text-text-secondary"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2 px-4 rounded-[8px] bg-accent text-white font-bold hover:opacity-95 disabled:opacity-50"
                >
                  {submitting ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ONE-TIME TEMPORARY PASSWORD MODAL (NEVER LOGGED) */}
      {tempPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[10px] border border-amber-300 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-[#ECE6DD] pb-3 text-amber-900">
              <div className="p-2 rounded-full bg-amber-100 text-amber-700">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="font-bold font-tajawal text-base">{tempPasswordModal.title}</h3>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-[8px] text-amber-900 text-xs">
              <p className="font-bold">تنبيه أمني هام:</p>
              <p className="mt-0.5 leading-relaxed">
                هذه كلمة المرور المؤقتة تظهر <strong>لمرة واحدة فقط الآن</strong> ولن يتم حفظها كنص صريح أو إظهارها مجدداً. يرجى نسخها وتسليمها للموظف:
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-text-secondary">اسم المستخدم:</span>
                <span className="font-mono font-bold text-text-primary mr-2">{tempPasswordModal.username}</span>
              </div>

              <div>
                <span className="text-text-secondary block mb-1">كلمة المرور المؤقتة:</span>
                <div className="flex items-center gap-2 bg-[#F6F1EA] p-3 rounded-[8px] border border-[#ECE6DD]">
                  <span className="font-mono font-bold text-base text-accent flex-1 select-all">
                    {tempPasswordModal.password}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(tempPasswordModal.password)}
                    className="py-1 px-2.5 rounded bg-white border border-[#ECE6DD] hover:bg-gray-50 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#ECE6DD]">
              <button
                type="button"
                onClick={() => setTempPasswordModal(null)}
                className="py-2 px-5 rounded-[8px] bg-accent text-white font-bold text-xs hover:opacity-95 cursor-pointer"
              >
                تم الحفظ والإغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

