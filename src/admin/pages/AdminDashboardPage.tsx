import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { apiClient } from '@/services/api/client'
import { useAdminAuth } from '../context/AdminAuthContext'
import type { AdminDashboardSummary } from '@/services/api/schemas/admin'
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
  Plus,
  ArrowRight,
  PackageCheck,
  Truck,
  Ban,
} from 'lucide-react'

export default function AdminDashboardPage() {
  const { user } = useAdminAuth()
  const [data, setData] = useState<AdminDashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true)
    try {
      const res = await apiClient.get<AdminDashboardSummary>('/api/admin/dashboard')
      setData(res)
      setError(null)
    } catch {
      setError('تعذر تحميل إحصائيات لوحة التحكم')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // Polling every 30 seconds
    const interval = setInterval(() => {
      fetchData()
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const isAdmin = user?.role === 'admin'

  return (
    <div className="space-y-6" dir="rtl">
      <Helmet>
        <title>لوحة المؤشرات — عزاب موتو</title>
      </Helmet>

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECE6DD] pb-4">
        <div>
          <h1 className="text-2xl font-black font-tajawal text-text-primary">لوحة المؤشرات العامة</h1>
          <p className="text-xs text-text-secondary mt-1">
            مرحباً بك مجدداً، <strong>{user?.name}</strong> • التحديث التلقائي كل 30 ثانية
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-2.5 rounded-[10px] border border-[#ECE6DD] bg-white hover:bg-[#F6F1EA] text-text-primary text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-accent' : ''}`} />
            <span className="hidden sm:inline">تحديث الآن</span>
          </button>
          {isAdmin && (
            <Link
              to="/admin/products/new"
              className="py-2.5 px-4 rounded-[10px] bg-accent text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-95 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قطعة غيار</span>
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-[10px] bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#F6F1EA] rounded-[10px] animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <>
          {/* Main 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Today Orders */}
            <div className="p-5 bg-white rounded-[10px] border border-[#ECE6DD] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-secondary">طلبات اليوم</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black font-tajawal text-text-primary">
                    {data.todayOrdersCount}
                  </span>
                  <span className="text-xs font-mono text-emerald-700 font-bold">
                    {data.todayOrdersTotal} ج.م
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            {/* Pending Orders */}
            <div className="p-5 bg-white rounded-[10px] border border-[#ECE6DD] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-secondary">طلبات قيد المتابعة</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black font-tajawal text-amber-600">
                    {data.pendingOrdersCount}
                  </span>
                  <span className="text-xs text-text-secondary">جديد + تجهيز</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="p-5 bg-white rounded-[10px] border border-[#ECE6DD] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-secondary">نواقص المخزون (≤ 5)</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black font-tajawal text-red-600">
                    {data.lowStockCount}
                  </span>
                  <span className="text-xs text-text-secondary">صنف يحتاج توريد</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            {/* Total Delivered */}
            <div className="p-5 bg-white rounded-[10px] border border-[#ECE6DD] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-secondary">إجمالي المسلم بنجاح</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black font-tajawal text-text-primary">
                    {data.statusCounts.delivered}
                  </span>
                  <span className="text-xs text-text-secondary">طلب مكتمل</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <PackageCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Status Breakdown Grid */}
          <div className="bg-white rounded-[10px] border border-[#ECE6DD] p-5 shadow-xs">
            <h2 className="text-sm font-bold font-tajawal text-text-primary mb-4">
              توزيع الطلبات حسب الحالة التشغيلية
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <Link
                to="/admin/orders?status=new"
                className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 transition-colors"
              >
                <div className="flex items-center justify-between text-blue-800">
                  <span className="text-xs font-semibold">طلبات جديدة</span>
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <p className="text-xl font-bold font-tajawal text-blue-900 mt-2">{data.statusCounts.new}</p>
              </Link>

              <Link
                to="/admin/orders?status=processing"
                className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 transition-colors"
              >
                <div className="flex items-center justify-between text-amber-800">
                  <span className="text-xs font-semibold">قيد التجهيز</span>
                  <Clock className="w-4 h-4" />
                </div>
                <p className="text-xl font-bold font-tajawal text-amber-900 mt-2">
                  {data.statusCounts.processing}
                </p>
              </Link>

              <Link
                to="/admin/orders?status=shipped"
                className="p-3 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100/50 transition-colors"
              >
                <div className="flex items-center justify-between text-purple-800">
                  <span className="text-xs font-semibold">تم الشحن</span>
                  <Truck className="w-4 h-4" />
                </div>
                <p className="text-xl font-bold font-tajawal text-purple-900 mt-2">
                  {data.statusCounts.shipped}
                </p>
              </Link>

              <Link
                to="/admin/orders?status=delivered"
                className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors"
              >
                <div className="flex items-center justify-between text-emerald-800">
                  <span className="text-xs font-semibold">تم التسليم</span>
                  <PackageCheck className="w-4 h-4" />
                </div>
                <p className="text-xl font-bold font-tajawal text-emerald-900 mt-2">
                  {data.statusCounts.delivered}
                </p>
              </Link>

              <Link
                to="/admin/orders?status=cancelled"
                className="p-3 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-100/50 transition-colors"
              >
                <div className="flex items-center justify-between text-red-800">
                  <span className="text-xs font-semibold">ملغاة</span>
                  <Ban className="w-4 h-4" />
                </div>
                <p className="text-xl font-bold font-tajawal text-red-900 mt-2">
                  {data.statusCounts.cancelled}
                </p>
              </Link>
            </div>
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-[10px] border border-[#ECE6DD] shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary font-tajawal">متابعة الطلبات المعلقة</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  تأكيد الطلبات الجديدة والتواصل مع العملاء لتسليم الشحنات
                </p>
              </div>
              <Link
                to="/admin/orders"
                className="py-2 px-3 rounded-lg bg-[#F6F1EA] text-text-primary text-xs font-bold hover:bg-[#ECE6DD] flex items-center gap-1"
              >
                <span>الانتقال</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>

            <div className="p-5 bg-white rounded-[10px] border border-[#ECE6DD] shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary font-tajawal">إدارة المخزون والتسعير</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  فحص كميات قطع الغيار المتاحة وتحديث الأسعار
                </p>
              </div>
              <Link
                to="/admin/products"
                className="py-2 px-3 rounded-lg bg-[#F6F1EA] text-text-primary text-xs font-bold hover:bg-[#ECE6DD] flex items-center gap-1"
              >
                <span>الانتقال</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

