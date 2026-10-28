import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { apiClient } from '@/services/api/client'
import { useAdminAuth } from '../context/AdminAuthContext'
import type { ExtendedMockProduct } from '@/services/mock/handlers/admin'
import type { Category } from '@/services/schemas/category'
import {
  ArrowRight,
  Upload,
  Trash2,
  Star,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

export default function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAdminAuth()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form fields
  const [name, setName] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [sku, setSku] = useState('')
  const [partNumber, setPartNumber] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [price, setPrice] = useState('')
  const [availability, setAvailability] = useState<'in_stock' | 'out_of_stock' | 'order_only'>('in_stock')
  const [isTracked, setIsTracked] = useState(true)
  const [stockQuantity, setStockQuantity] = useState<number>(10)
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)

  const isCreate = !id || id === 'new'
  const isAdmin = user?.role === 'admin'

  const loadData = useCallback(async () => {
    try {
      const cats = await apiClient.get<Category[]>('/api/admin/categories')
      setCategories(cats)

      if (!isCreate && id) {
        const prod = await apiClient.get<ExtendedMockProduct>(`/api/admin/products/${id}`)
        setName(prod.name)
        setNameEn(prod.nameEn)
        setSku(prod.sku)
        setPartNumber(prod.partNumber || '')
        setCategoryId(prod.categoryId)
        setPrice(prod.price)
        setAvailability(prod.availability)
        setIsTracked(prod.stockQuantity !== null && prod.stockQuantity !== undefined)
        setStockQuantity(prod.stockQuantity ?? 10)
        setDescription(prod.description)
        setImages(prod.images || [])
        setIsActive(prod.isActive ?? true)
      } else {
        if (cats.length > 0) setCategoryId(cats[0].id)
      }
    } catch {
      setError('تعذر تحميل بيانات القطعة أو التصنيفات')
    } finally {
      setLoading(false)
    }
  }, [id, isCreate])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('صيغة الصورة غير مدعومة. يرجى اختيار ملفات JPEG أو PNG أو WebP.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة يجب ألا يتجاوز 5 ميجابايت.')
        return
      }
    }

    // Mock upload URL for preview
    const fakeUploaded = Array.from(files).map((f) => URL.createObjectURL(f))
    setImages((prev) => [...prev, ...fakeUploaded])
  }

  const handleDeleteImage = (index: number) => {
    if (images.length <= 1) {
      alert('يجب الإبقاء على صورة واحدة على الأقل للمنتج')
      return
    }
    setImages((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return
    setImages((prev) => {
      const copy = [...prev]
      const [item] = copy.splice(index, 1)
      copy.unshift(item)
      return copy
    })
  }

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= images.length) return
    setImages((prev) => {
      const copy = [...prev]
      const temp = copy[index]
      copy[index] = copy[targetIdx]
      copy[targetIdx] = temp
      return copy
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) {
      alert('غير مصرح لك بإجراء تعديلات، هذه العملية خاصة بمدير النظام.')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    const payload = {
      name: name.trim(),
      nameEn: nameEn.trim(),
      sku: sku.trim(),
      partNumber: partNumber.trim(),
      categoryId,
      price: parseFloat(price || '0').toFixed(2),
      availability,
      stockQuantity: isTracked ? Number(stockQuantity) : null,
      description: description.trim(),
      images: images.length > 0 ? images : ['/logo.png'],
      isActive,
    }

    try {
      if (isCreate) {
        await apiClient.post('/api/admin/products', payload)
        setSuccess('تم إنشاء قطعة الغيار بنجاح!')
        setTimeout(() => navigate('/admin/products'), 1200)
      } else {
        await apiClient.patch(`/api/admin/products/${id}`, payload)
        setSuccess('تم حفظ تعديلات القطعة بنجاح!')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'تعذر حفظ البيانات')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-text-secondary text-sm">جارٍ تحميل المحرر...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      <Helmet>
        <title>{isCreate ? 'إضافة قطعة غيار — عزاب موتو' : `تعديل ${name} — عزاب موتو`}</title>
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#ECE6DD] pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-lg border border-[#ECE6DD] bg-white hover:bg-[#F6F1EA] text-text-secondary"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold font-tajawal text-text-primary">
              {isCreate ? 'إضافة قطعة غيار جديدة' : `تعديل قطعة: ${name}`}
            </h1>
            <p className="text-xs text-text-secondary">
              {isCreate ? 'إدخال مواصفات القطعة وتعيين الصور والمخزون' : `كود SKU: ${sku}`}
            </p>
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-[10px]">
          تنبيه: أنت مسجل بحساب "مسؤول طلبات"، تتوفر لديك صلاحية الاطلاع فقط، ولا يمكنك حفظ أي تعديلات.
        </div>
      )}

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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-[10px] border border-[#ECE6DD] p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold font-tajawal text-text-primary border-b border-[#ECE6DD] pb-2">
            البيانات الأساسية والتصنيف
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                اسم القطعة بالعربية *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] border border-[#ECE6DD] text-xs focus:outline-hidden focus:border-accent"
                required
                disabled={!isAdmin}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                اسم القطعة بالإنجليزية *
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] border border-[#ECE6DD] text-xs focus:outline-hidden focus:border-accent"
                required
                disabled={!isAdmin}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">كود SKU *</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] border border-[#ECE6DD] text-xs font-mono focus:outline-hidden focus:border-accent"
                required
                disabled={!isAdmin}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                رقم القطعة لدى المصنع (OEM Part Number)
              </label>
              <input
                type="text"
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] border border-[#ECE6DD] text-xs font-mono focus:outline-hidden focus:border-accent"
                disabled={!isAdmin}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">التصنيف *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] border border-[#ECE6DD] text-xs bg-white focus:outline-hidden focus:border-accent"
                required
                disabled={!isAdmin}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">السعر (ج.م) *</label>
              <input
                type="number"
                step="0.50"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] border border-[#ECE6DD] text-xs font-mono focus:outline-hidden focus:border-accent"
                required
                disabled={!isAdmin}
              />
            </div>
          </div>
        </div>

        {/* Stock & Availability Card */}
        <div className="bg-white rounded-[10px] border border-[#ECE6DD] p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold font-tajawal text-text-primary border-b border-[#ECE6DD] pb-2">
            المخزون وحالة التوفر
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">حالة التوفر بالمتجر</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as typeof availability)}
                className="w-full px-3 py-2 rounded-[8px] border border-[#ECE6DD] text-xs bg-white focus:outline-hidden focus:border-accent"
                disabled={!isAdmin}
              >
                <option value="in_stock">متوفر في المخزن (In Stock)</option>
                <option value="out_of_stock">غير متوفر حالياً (Out of Stock)</option>
                <option value="order_only">بالطلب المسبق فقط (Order Only)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">الكمية في المخزن</label>
              <div className="space-y-2">
                <input
                  type="number"
                  min="0"
                  disabled={!isTracked || !isAdmin}
                  value={isTracked ? stockQuantity : ''}
                  onChange={(e) => setStockQuantity(parseInt(e.target.value, 10) || 0)}
                  placeholder={isTracked ? 'أدخل الكمية...' : 'مخزون غير متتبع كمياً'}
                  className="w-full px-3 py-2 rounded-[8px] border border-[#ECE6DD] text-xs font-mono focus:outline-hidden focus:border-accent disabled:bg-gray-100"
                />
                <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTracked}
                    onChange={(e) => setIsTracked(e.target.checked)}
                    disabled={!isAdmin}
                  />
                  <span>تتبع المخزون بالعدد (عند إلغاء التحديد يصبح المخزون غير محدد الكمية)</span>
                </label>
              </div>
            </div>

            <div className="md:col-span-2 pt-2 border-t border-[#ECE6DD]">
              <label className="flex items-center gap-2 text-xs font-bold text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={!isAdmin}
                />
                <span>تفعيل القطعة وعرضها في المتجر العام (Soft Delete: إلغاء التحديد يخفي القطعة ويحفظ بيانات الطلبات)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Images Management Card */}
        <div className="bg-white rounded-[10px] border border-[#ECE6DD] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECE6DD] pb-2">
            <h2 className="text-sm font-bold font-tajawal text-text-primary">
              صور القطعة (الصورة الأولى تعتبر الأساسية)
            </h2>
            {isAdmin && (
              <label className="py-1 px-3 rounded-lg border border-[#ECE6DD] bg-[#F6F1EA] hover:bg-[#ECE6DD] text-text-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-accent" />
                <span>رفع صورة</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative group border border-[#ECE6DD] rounded-[8px] p-2 bg-[#FFFDF9] flex flex-col items-center"
              >
                <img
                  src={img}
                  alt={`صورة ${idx + 1}`}
                  className="w-24 h-24 object-contain mb-2"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = '/logo.png'
                  }}
                />
                {idx === 0 && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent text-white flex items-center gap-0.5 shadow-xs">
                    <Star className="w-3 h-3 fill-white" />
                    <span>أساسية</span>
                  </span>
                )}
                {isAdmin && (
                  <div className="flex items-center gap-1 mt-auto">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        className="p-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 text-[10px]"
                        title="تعيين كأساسية"
                      >
                        <Star className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveImage(idx, 'up')}
                      className="p-1 rounded bg-[#F6F1EA] text-text-secondary hover:bg-[#ECE6DD] disabled:opacity-30"
                      title="تقديم"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => handleMoveImage(idx, 'down')}
                      className="p-1 rounded bg-[#F6F1EA] text-text-secondary hover:bg-[#ECE6DD] disabled:opacity-30"
                      title="تأخير"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(idx)}
                      className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                      title="حذف الصورة"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-[10px] border border-[#ECE6DD] p-5 shadow-xs space-y-2">
          <label className="block text-xs font-bold text-text-primary">الوصف والمواصفات الفنية</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-[8px] border border-[#ECE6DD] text-xs focus:outline-hidden focus:border-accent"
            placeholder="تفاصيل القطعة، الجودة، فترة الضمان، وتعليمات التركيب..."
            disabled={!isAdmin}
          />
        </div>

        {/* Action Button */}
        {isAdmin && (
          <div className="flex justify-end gap-3">
            <Link
              to="/admin/products"
              className="py-2.5 px-5 rounded-[10px] border border-[#ECE6DD] bg-white text-xs font-bold text-text-secondary hover:bg-[#F6F1EA]"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 rounded-[10px] bg-accent text-white text-xs font-bold hover:opacity-95 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {saving ? 'جارٍ الحفظ...' : isCreate ? 'إضافة القطعة للمتجر' : 'حفظ التعديلات'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

