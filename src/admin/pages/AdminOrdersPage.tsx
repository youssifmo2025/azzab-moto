import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { apiClient } from '@/services/api/client'
import { useAdminAuth } from '../context/AdminAuthContext'
import type { PaginatedAdminOrders, AdminOrderSummary } from '@/services/api/schemas/admin'
import type { OrderStatus } from '@/services/api/schemas/order'
import {
  Search,
  Filter,
  FileDown,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  Ban,
  Package,
} from 'lucide-react'

const GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'الشرقية',
  'القليوبية',
  'البحيرة',
  'الغربية',
  'المنوفية',
  'كفر الشيخ',
  'الفيوم',
  'بني سويف',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'السويس',
  'الإسماعيلية',
  'بورسعيد',
]

export default function AdminOrdersPage() {
  const { user } = useAdminAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [orders, setOrders] = useState<AdminOrderSummary[]>([])
  const [meta, setMeta] = useState({ page: 1, perPage: 20, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const currentStatus = searchParams.get('status') || ''
  const currentGov = searchParams.get('governorate') || ''
  const currentQ = searchParams.get('q') || ''

  const fetchOrders = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true)
    try {
      const res = await apiClient.get<PaginatedAdminOrders>('/api/admin/orders', {
        params: {
          page: currentPage,
          perPage: 20,
          status: currentStatus || undefined,
          governorate: currentGov || undefined,
          q: currentQ || undefined,
        },
      })
      setOrders(res.data)
      setMeta(res.meta)
      setError(null)
    } catch {
      setError('تعذر تحميل الطلبات')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [currentPage, currentStatus, currentGov, currentQ])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(() => {
      fetchOrders()
    }, 20000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', '1')
      return next
    })
    fetchOrders()
  }

  const handleExportCsv = async () => {
    setExporting(true)
    try {
      const blob = await apiClient.get<Blob>('/api/admin/orders/export/csv')
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch {
      alert('تعذر تصدير ملف الطلبات')
    } finally {
      setExporting(false)
    }
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Package className="w-3.5 h-3.5" />
            <span>جديد</span>
          </span>
        )
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>قيد التجهيز</span>
          </span>
        )
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <Truck className="w-3.5 h-3.5" />
            <span>تم الشحن</span>
          </span>
        )
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تم التسليم</span>
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-200">
            <Ban className="w-3.5 h-3.5" />
            <span>ملغي</span>
          </span>
        )
    }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="space-y-6" dir="rtl">
      <Helmet>
        <title>إدارة الطلبات — عزاب موتو</title>
      </Helmet>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECE6DD] pb-4">
        <div>
          <h1 className="text-2xl font-black font-tajawal text-text-primary">سجل الطلبات والمبيعات</h1>
          <p className="text-xs text-text-secondary mt-1">
            إجمالي {meta.total} طلب مسجل • تحديث دوري حي
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="p-2.5 rounded-[10px] border border-[#ECE6DD] bg-white hover:bg-[#F6F1EA] text-text-primary text-xs font-semibold flex items-center gap-2 cursor-pointer"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-accent' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
          {isAdmin && (
            <button
              onClick={handleExportCsv}
              disabled={exporting}
              className="py-2.5 px-3.5 rounded-[10px] border border-[#ECE6DD] bg-white hover:bg-[#F6F1EA] text-text-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FileDown className="w-4 h-4 text-emerald-700" />
              <span>{exporting ? 'جارٍ التصدير...' : 'تصدير CSV'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-[10px] border border-[#ECE6DD] p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
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
              placeholder="ابحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
              className="w-full px-3 py-2 pr-9 rounded-[10px] border border-[#ECE6DD] text-xs focus:outline-hidden focus:border-accent"
            />
            <Search className="w-4 h-4 text-text-secondary absolute right-3 top-2.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <Filter className="w-4 h-4" />
              <span>الحالة:</span>
            </div>
            <select
              value={currentStatus}
              onChange={(e) => {
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev)
                  if (e.target.value) next.set('status', e.target.value)
                  else next.delete('status')
                  next.set('page', '1')
                  return next
                })
              }}
              className="px-2.5 py-2 rounded-[10px] border border-[#ECE6DD] text-xs bg-white focus:outline-hidden focus:border-accent"
            >
              <option value="">كافة الحالات</option>
              <option value="new">جديد</option>
              <option value="processing">قيد التجهيز</option>
              <option value="shipped">تم الشحن</option>
              <option value="delivered">تم التسليم</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={currentGov}
              onChange={(e) => {
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev)
                  if (e.target.value) next.set('governorate', e.target.value)
                  else next.delete('governorate')
                  next.set('page', '1')
                  return next
                })
              }}
              className="px-2.5 py-2 rounded-[10px] border border-[#ECE6DD] text-xs bg-white focus:outline-hidden focus:border-accent"
            >
              <option value="">كافة المحافظات</option>
              {GOVERNORATES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-3 rounded-[10px] bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-[10px] border border-[#ECE6DD] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#F6F1EA] border-b border-[#ECE6DD] text-text-secondary font-bold">
              <tr>
                <th className="py-3 px-4">رقم الطلب</th>
                <th className="py-3 px-4">العميل</th>
                <th className="py-3 px-4">رقم الهاتف</th>
                <th className="py-3 px-4">المحافظة</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">الإجمالي</th>
                <th className="py-3 px-4">تاريخ الطلب</th>
                <th className="py-3 px-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE6DD]">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-text-secondary">
                    جارٍ تحميل الطلبات...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-text-secondary">
                    لا توجد طلبات مطابقة للبحث أو الفلتر المختار
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FFFDF9] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-accent">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-text-primary">
                      {order.customerName}
                    </td>
                    <td className="py-3 px-4 font-mono text-text-secondary dir-ltr text-right">
                      {order.phone}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">{order.governorate}</td>
                    <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-text-primary">
                      {order.total} ج.م
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-[#F6F1EA] hover:bg-[#ECE6DD] text-text-primary font-bold text-[11px] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>التفاصيل</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {meta.totalPages > 1 && (
          <div className="p-3 border-t border-[#ECE6DD] bg-[#F6F1EA]/50 flex items-center justify-between text-xs">
            <span className="text-text-secondary">
              الصفحة {meta.page} من {meta.totalPages} (إجمالي {meta.total} طلب)
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

