import { useEffect, useState, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { apiClient } from '@/services/api/client'
import { ApiClientError } from '@/services/api/schemas/error'
import { useAdminAuth } from '../context/AdminAuthContext'
import type { Category } from '@/services/schemas/category'
import {
  FolderTree,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react'

export default function AdminCategoriesPage() {
  const { user } = useAdminAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [icon, setIcon] = useState('Cog')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isAdmin = user?.role === 'admin'

  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiClient.get<Category[]>('/api/admin/categories')
      setCategories(res)
      setError(null)
    } catch {
      setError('تعذر تحميل التصنيفات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const openCreateModal = () => {
    setEditingCategory(null)
    setName('')
    setSlug('')
    setIcon('Cog')
    setDescription('')
    setModalOpen(true)
  }

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat)
    setName(cat.name)
    setSlug(cat.slug)
    setIcon(cat.icon)
    setDescription(cat.description || '')
    setModalOpen(true)
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) return

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    const payload = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      icon: icon.trim(),
      description: description.trim() || undefined,
    }

    try {
      if (editingCategory) {
        await apiClient.patch(`/api/admin/categories/${editingCategory.id}`, payload)
        setSuccess('تم تحديث التصنيف بنجاح!')
      } else {
        await apiClient.post('/api/admin/categories', payload)
        setSuccess('تم إنشاء التصنيف الجديد بنجاح!')
      }
      setModalOpen(false)
      fetchCategories()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'تعذر حفظ التصنيف')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCategory = async (cat: Category) => {
    if (!isAdmin) return
    if (!window.confirm(`هل أنت متأكد من حذف تصنيف "${cat.name}"؟`)) return

    setError(null)
    setSuccess(null)

    try {
      await apiClient.delete(`/api/admin/categories/${cat.id}`)
      setSuccess('تم حذف التصنيف بنجاح')
      fetchCategories()
    } catch (err: unknown) {
      if (err instanceof ApiClientError && err.status === 409) {
        setError(err.message || 'لا يمكن حذف التصنيف لأنه يحتوي على قطع غيار مرتبطة به')
      } else {
        setError(err instanceof Error ? err.message : 'تعذر حذف التصنيف')
      }
    }
  }

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    if (!isAdmin) return
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= categories.length) return

    const copy = [...categories]
    const temp = copy[index]
    copy[index] = copy[targetIdx]
    copy[targetIdx] = temp
    setCategories(copy)

    try {
      await apiClient.put('/api/admin/categories/reorder', {
        categoryIds: copy.map((c) => c.id),
      })
    } catch {
      fetchCategories() // rollback
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Helmet>
        <title>إدارة التصنيفات — عزاب موتو</title>
      </Helmet>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECE6DD] pb-4">
        <div>
          <h1 className="text-2xl font-black font-tajawal text-text-primary">تصنيفات قطع الغيار</h1>
          <p className="text-xs text-text-secondary mt-1">
            ترتيب وتصنيف قطع الغيار في المتجر وفق أقسام الدراجة النارية
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="py-2.5 px-4 rounded-[10px] bg-accent text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-95 transition-opacity cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تصنيف جديد</span>
          </button>
        )}
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

      {/* Categories Table */}
      <div className="bg-white rounded-[10px] border border-[#ECE6DD] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#F6F1EA] border-b border-[#ECE6DD] text-text-secondary font-bold">
              <tr>
                {isAdmin && <th className="py-3 px-3 text-center">الترتيب</th>}
                <th className="py-3 px-4">اسم التصنيف</th>
                <th className="py-3 px-4">المعرف (Slug)</th>
                <th className="py-3 px-4">الأيقونة</th>
                <th className="py-3 px-4">الوصف</th>
                {isAdmin && <th className="py-3 px-4 text-center">الإجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE6DD]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-secondary">
                    جارٍ تحميل التصنيفات...
                  </td>
                </tr>
              ) : (
                categories.map((cat, idx) => (
                  <tr key={cat.id} className="hover:bg-[#FFFDF9] transition-colors">
                    {isAdmin && (
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleReorder(idx, 'up')}
                            className="p-1 rounded bg-[#F6F1EA] text-text-secondary hover:bg-[#ECE6DD] disabled:opacity-30"
                            title="تحريك لأعلى"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === categories.length - 1}
                            onClick={() => handleReorder(idx, 'down')}
                            className="p-1 rounded bg-[#F6F1EA] text-text-secondary hover:bg-[#ECE6DD] disabled:opacity-30"
                            title="تحريك لأسفل"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                    <td className="py-2.5 px-4 font-bold text-text-primary text-sm flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-accent" />
                      <span>{cat.name}</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-accent">{cat.slug}</td>
                    <td className="py-2.5 px-4 font-mono text-text-secondary">{cat.icon}</td>
                    <td className="py-2.5 px-4 text-text-secondary max-w-xs truncate">
                      {cat.description || '—'}
                    </td>
                    {isAdmin && (
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-1.5 rounded-lg border border-[#ECE6DD] bg-[#F6F1EA] hover:bg-[#ECE6DD] text-text-primary"
                            title="تعديل"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-[10px] border border-[#ECE6DD] shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ECE6DD] pb-3">
              <h3 className="font-bold font-tajawal text-text-primary">
                {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-text-secondary hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-text-secondary mb-1">اسم التصنيف *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (!editingCategory && !slug) {
                      setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
                    }
                  }}
                  className="w-full px-3 py-2 rounded-[8px] border border-[#ECE6DD] text-xs focus:outline-hidden focus:border-accent"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-text-secondary mb-1">المعرف اللطيف (Slug) *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-[8px] border border-[#ECE6DD] text-xs font-mono focus:outline-hidden focus:border-accent"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-text-secondary mb-1">اسم الأيقونة (Lucide Icon) *</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-3 py-2 rounded-[8px] border border-[#ECE6DD] text-xs font-mono focus:outline-hidden focus:border-accent"
                  placeholder="Disc, Filter, Zap, Cog..."
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-text-secondary mb-1">الوصف</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-[8px] border border-[#ECE6DD] text-xs focus:outline-hidden focus:border-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#ECE6DD]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2 px-4 rounded-[8px] border border-[#ECE6DD] bg-white text-text-secondary"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2 px-4 rounded-[8px] bg-accent text-white font-bold hover:opacity-95 disabled:opacity-50"
                >
                  {submitting ? 'جارٍ الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

