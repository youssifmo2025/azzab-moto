import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { apiClient } from '@/services/api/client'
import { useAdminAuth } from '../context/AdminAuthContext'
import type { ExtendedMockProduct } from '@/services/mock/handlers/admin'
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  EyeOff,
  Eye,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export default function AdminProductsPage() {
  const { user } = useAdminAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState<ExtendedMockProduct[]>([])
  const [meta, setMeta] = useState({ page: 1, perPage: 20, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const currentQ = searchParams.get('q') || ''

  const fetchProducts = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true)
    try {
      const res = await apiClient.get<{ data: ExtendedMockProduct[]; meta: typeof meta }>('/api/admin/products', {
        params: { page: currentPage, perPage: 20 },
      })
      let list = res.data
      if (currentQ.trim()) {
        const q = currentQ.toLowerCase()
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.partNumber.toLowerCase().includes(q),
        )
      }
      setProducts(list)
      setMeta(res.meta)
      setError(null)
    } catch {
      setError('تعذر تحميل قائمة قطع الغيار')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [currentPage, currentQ])

  useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  const handleToggleSoftDelete = async (product: ExtendedMockProduct) => {
    if (!isAdmin) return
    const nextState = !product.isActive
    const msg = nextState
      ? `هل تريد إعادة تفعيل القطعة "${product.name}" وإظهارها بالمتجر؟`
      : `هل تريد إلغاء تفعيل (الحذف المرن) للقطعة "${product.name}"؟ ستبقى مسجلة في الطلبات التاريخية وتختفي من المتجر.`

    if (!window.confirm(msg)) return

    setActionLoading(product.id)
    try {
      await apiClient.patch(`/api/admin/products/${product.id}`, { isActive: nextState })
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: nextState } : p)),
      )
    } catch {
      alert('تعذر تحديث حالة القطعة')
    } finally {
      setActionLoading(null)
    }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="space-y-6" dir="rtl">
      <Helmet>
        <title>إدارة قطع الغيار والمخزون — عزاب موتو</title>
      </Helmet>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECE6DD] pb-4">
        <div>
          <h1 className="text-2xl font-black font-tajawal text-text-primary">قطع الغيار والمخزون</h1>
          <p className="text-xs text-text-secondary mt-1">
            إدارة الكتالوج وتتبع الكميات المتاحة والتسعير
            {!isAdmin && ' (صلاحية عرض المخزون فقط لمسؤولي الطلبات)'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchProducts(true)}
            disabled={refreshing}
            className="p-2.5 rounded-[10px] border border-[#ECE6DD] bg-white hover:bg-[#F6F1EA] text-text-primary text-xs font-semibold flex items-center gap-2 cursor-pointer"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-accent' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
          {isAdmin && (
            <Link
              to="/admin/products/new"
              className="py-2.5 px-4 rounded-[10px] bg-accent text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-95 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قطعة جديدة</span>
            </Link>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-[10px] border border-[#ECE6DD] p-3 shadow-xs">
        <div className="relative">
          <input
            type="text"
            value={currentQ}
            onChange={(e) => {
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev)
                if (e.target.value) next.set('q', e.target.value)
                else next.delete('q')
                return next
              })
            }}
            placeholder="بحث بالاسم، كود SKU، أو رقم القطعة OEM..."
            className="w-full px-3 py-2 pr-9 rounded-[8px] border border-[#ECE6DD] text-xs focus:outline-hidden focus:border-accent"
          />
          <Search className="w-4 h-4 text-text-secondary absolute right-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-[10px] bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-[10px] border border-[#ECE6DD] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#F6F1EA] border-b border-[#ECE6DD] text-text-secondary font-bold">
              <tr>
                <th className="py-3 px-4">الصورة</th>
                <th className="py-3 px-4">اسم القطعة</th>
                <th className="py-3 px-4">كود SKU</th>
                <th className="py-3 px-4">السعر</th>
                <th className="py-3 px-4">المخزون المتاح</th>
                <th className="py-3 px-4">الحالة في المتجر</th>
                {isAdmin && <th className="py-3 px-4 text-center">الإجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE6DD]">
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-secondary">
                    جارٍ تحميل المنتجات...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-secondary">
                    لا توجد قطع غيار مطابقة للبحث
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = p.stockQuantity !== null && p.stockQuantity !== undefined && p.stockQuantity <= 5
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-[#FFFDF9] transition-colors ${
                        p.isActive === false ? 'opacity-60 bg-gray-50/70' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4">
                        <img
                          src={p.images[0] || '/placeholder.jpg'}
                          alt={p.name}
                          className="w-10 h-10 object-contain rounded-md border border-[#ECE6DD] bg-white p-0.5"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = '/logo.png'
                          }}
                        />
                      </td>
                      <td className="py-2.5 px-4 font-bold text-text-primary">
                        <div>{p.name}</div>
                        <div className="text-[11px] text-text-secondary font-normal">{p.nameEn}</div>
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-accent">
                        {p.sku}
                        {p.partNumber && <div className="text-[10px] text-text-secondary font-mono">{p.partNumber}</div>}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-text-primary">{p.price} ج.م</td>
                      <td className="py-2.5 px-4">
                        {p.stockQuantity === null || p.stockQuantity === undefined ? (
                          <span className="text-text-secondary italic">غير محدد (متاح)</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold">{p.stockQuantity} قطع</span>
                            {isLow && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                                <AlertTriangle className="w-3 h-3" />
                                <span>نقص</span>
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        {p.isActive === false ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-gray-200 text-gray-700">
                            معطل (Soft Deleted)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            نشط معروض
                          </span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="py-2.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Link
                              to={`/admin/products/${p.id}`}
                              className="p-1.5 rounded-lg border border-[#ECE6DD] bg-[#F6F1EA] hover:bg-[#ECE6DD] text-text-primary text-xs"
                              title="تعديل القطعة"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleToggleSoftDelete(p)}
                              disabled={actionLoading === p.id}
                              className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                                p.isActive === false
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                              }`}
                              title={p.isActive === false ? 'إعادة التفعيل' : 'إلغاء التفعيل (حذف مرن)'}
                            >
                              {p.isActive === false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {meta.totalPages > 1 && (
          <div className="p-3 border-t border-[#ECE6DD] bg-[#F6F1EA]/50 flex items-center justify-between text-xs">
            <span className="text-text-secondary">
              الصفحة {meta.page} من {meta.totalPages} (إجمالي {meta.total} صنف)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={meta.page <= 1}
                onClick={() => {
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev)
                    next.set('page', String(meta.page - 1))
                    return next
                  })
                }}
                className="p-1.5 rounded-md border border-[#ECE6DD] bg-white disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => {
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev)
                    next.set('page', String(meta.page + 1))
                    return next
                  })
                }}
                className="p-1.5 rounded-md border border-[#ECE6DD] bg-white disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

