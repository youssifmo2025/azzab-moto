import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { apiClient } from '@/services/api/client'
import type { AdminOrderDetail } from '@/services/api/schemas/order'
import type { OrderStatus } from '@/services/api/schemas/order'
import {
  Printer,
  ArrowRight,
  Clock,
  CheckCircle2,
  Truck,
  Ban,
  Package,
  User as UserIcon,
  MapPin,
  Phone,
  FileText,
  AlertCircle,
} from 'lucide-react'

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<AdminOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('')
  const [statusNote, setStatusNote] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null)

  const fetchOrder = useCallback(async () => {
    if (!id) return
    try {
      const res = await apiClient.get<AdminOrderDetail>(`/api/admin/orders/${id}`)
      setOrder(res)
      setError(null)
    } catch {
      setError('تعذر تحميل بيانات الطلب أو أن الطلب غير موجود')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  const getAllowedNextStatuses = (current: OrderStatus): Array<{ value: OrderStatus; label: string }> => {
    switch (current) {
      case 'new':
        return [
          { value: 'processing', label: 'بدء التجهيز (Processing)' },
          { value: 'cancelled', label: 'إلغاء الطلب (Cancelled)' },
        ]
      case 'processing':
        return [
          { value: 'shipped', label: 'تم الشحن والتسليم لشركة التوصيل (Shipped)' },
          { value: 'cancelled', label: 'إلغاء الطلب (Cancelled)' },
        ]
      case 'shipped':
        return [
          { value: 'delivered', label: 'تم التسليم واستلام المبلغ COD (Delivered)' },
          { value: 'cancelled', label: 'إلغاء الشحنة (Cancelled)' },
        ]
      case 'delivered':
      case 'cancelled':
        return [] // Terminal states
    }
  }

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order || !newStatus) return

    setUpdating(true)
    setUpdateError(null)
    setUpdateSuccess(null)

    try {
      const updated = await apiClient.patch<AdminOrderDetail>(`/api/admin/orders/${order.id}/status`, {
        status: newStatus,
        note: statusNote.trim() || undefined,
      })
      setOrder(updated)
      setNewStatus('')
      setStatusNote('')
      setUpdateSuccess('تم تحديث حالة الطلب بنجاح!')
    } catch (err: unknown) {
      setUpdateError(err instanceof Error ? err.message : 'تعذر تحديث الحالة')
    } finally {
      setUpdating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-text-secondary text-sm" dir="rtl">
        جارٍ تحميل بيانات الطلب...
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="space-y-4" dir="rtl">
        <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent font-bold">
          <ArrowRight className="w-4 h-4" />
          <span>العودة لقائمة الطلبات</span>
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[10px]">
          {error || 'الطلب غير موجود'}
        </div>
      </div>
    )
  }

  const allowedNext = getAllowedNextStatuses(order.status)
  const isTerminal = allowedNext.length === 0

  return (
    <div className="space-y-6" dir="rtl">
      <Helmet>
        <title>{`طلب ${order.orderNumber} — عزاب موتو`}</title>
      </Helmet>

      {/* Breadcrumb & Actions Bar (Hidden on Print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECE6DD] pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-2 rounded-lg border border-[#ECE6DD] bg-white hover:bg-[#F6F1EA] text-text-secondary"
            title="العودة للقائمة"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black font-tajawal text-text-primary">
                تفاصيل الطلب: {order.orderNumber}
              </h1>
            </div>
            <p className="text-xs text-text-secondary">
              تاريخ الإنشاء: {new Date(order.createdAt).toLocaleString('ar-EG')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="py-2 px-3.5 rounded-[10px] border border-[#ECE6DD] bg-white hover:bg-[#F6F1EA] text-text-primary text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-accent" />
            <span>طباعة الفاتورة / بوليصة الشحن</span>
          </button>
        </div>
      </div>

      {/* PRINT-ONLY INVOICE HEADER */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black font-tajawal">متجر عزاب موتو — قطع غيار TVS</h1>
            <p className="text-xs">المتجر المعتمد لقطع غيار TVS في مصر • هاتف: 01141334668</p>
          </div>
          <div className="text-left font-mono">
            <p className="text-sm font-bold">رقم الفاتورة: {order.orderNumber}</p>
            <p className="text-xs">التاريخ: {new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
          </div>
        </div>
      </div>

      {/* Grid: Order summary and Status Machine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Items & Customer Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Shipping Card */}
          <div className="bg-white rounded-[10px] border border-[#ECE6DD] p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold font-tajawal text-text-primary flex items-center gap-2 border-b border-[#ECE6DD] pb-2">
              <UserIcon className="w-4 h-4 text-accent" />
              <span>بيانات العميل وعنوان التوصيل</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-text-secondary mb-0.5">اسم العميل:</p>
                <p className="font-bold text-text-primary text-sm">{order.customer.name}</p>
              </div>
              <div>
                <p className="text-text-secondary mb-0.5">رقم الهاتف:</p>
                <p className="font-bold font-mono text-sm text-text-primary flex items-center gap-1 dir-ltr justify-end">
                  <span>{order.customer.phone}</span>
                  <Phone className="w-3.5 h-3.5 text-accent" />
                </p>
              </div>
              <div>
                <p className="text-text-secondary mb-0.5">المحافظة والمركز:</p>
                <p className="font-semibold text-text-primary">
                  {order.customer.governorate} — {order.customer.city}
                </p>
              </div>
              <div>
                <p className="text-text-secondary mb-0.5">طريقة الدفع:</p>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  الدفع عند الاستلام (COD)
                </span>
              </div>
              <div className="sm:col-span-2">
                <p className="text-text-secondary mb-0.5">العنوان بالتفصيل:</p>
                <p className="font-medium text-text-primary bg-[#F6F1EA]/60 p-2.5 rounded-[8px] border border-[#ECE6DD] flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>{order.customer.address}</span>
                </p>
              </div>
              {order.customer.notes && (
                <div className="sm:col-span-2">
                  <p className="text-text-secondary mb-0.5">ملاحظات العميل:</p>
                  <p className="text-xs text-text-primary italic bg-amber-50/70 p-2.5 rounded-[8px] border border-amber-200">
                    "{order.customer.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-[10px] border border-[#ECE6DD] overflow-hidden shadow-xs">
            <div className="p-4 bg-[#F6F1EA] border-b border-[#ECE6DD] flex items-center justify-between">
              <h2 className="text-sm font-bold font-tajawal text-text-primary flex items-center gap-2">
                <Package className="w-4 h-4 text-accent" />
                <span>القطع المطلوبة ({order.items.length})</span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#FFFDF9] border-b border-[#ECE6DD] text-text-secondary font-bold">
                  <tr>
                    <th className="py-2.5 px-4">كود SKU</th>
                    <th className="py-2.5 px-4">اسم القطعة</th>
                    <th className="py-2.5 px-4 text-center">الكمية</th>
                    <th className="py-2.5 px-4">السعر</th>
                    <th className="py-2.5 px-4">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE6DD]">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-4 font-mono text-accent font-bold">{item.sku}</td>
                      <td className="py-2.5 px-4 font-medium text-text-primary">{item.productName}</td>
                      <td className="py-2.5 px-4 text-center font-bold text-text-primary font-mono">{item.quantity}</td>
                      <td className="py-2.5 px-4 font-mono text-text-secondary">{item.price} ج.م</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-text-primary">{item.total} ج.م</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="p-4 border-t border-[#ECE6DD] bg-[#FFFDF9] space-y-1.5 text-xs text-left font-mono">
              <div className="flex justify-between text-text-secondary">
                <span className="font-sans font-medium text-right">المجموع الفرعي للقطع:</span>
                <span>{order.subtotal} ج.م</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span className="font-sans font-medium text-right">مصاريف الشحن:</span>
                <span>{order.shippingFee} ج.م</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-text-primary border-t border-[#ECE6DD] pt-2">
                <span className="font-sans font-black text-right">الإجمالي النهائي المطلوب تحصيله:</span>
                <span className="text-accent text-base">{order.total} ج.م</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Status Management & Audit Trail */}
        <div className="space-y-6">
          {/* Status Machine Card (Hidden on Print) */}
          <div className="print:hidden bg-white rounded-[10px] border border-[#ECE6DD] p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold font-tajawal text-text-primary flex items-center gap-2 border-b border-[#ECE6DD] pb-2">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span>إدارة وتحديث حالة الطلب</span>
            </h2>

            <div className="text-xs">
              <span className="text-text-secondary">الحالة الحالية:</span>
              <div className="mt-1">
                {order.status === 'new' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 font-bold">
                    <Package className="w-4 h-4" /> طلب جديد
                  </span>
                )}
                {order.status === 'processing' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold">
                    <Clock className="w-4 h-4" /> قيد التجهيز
                  </span>
                )}
                {order.status === 'shipped' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 font-bold">
                    <Truck className="w-4 h-4" /> تم الشحن
                  </span>
                )}
                {order.status === 'delivered' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> تم التسليم بنجاح
                  </span>
                )}
                {order.status === 'cancelled' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-900 font-bold">
                    <Ban className="w-4 h-4" /> تم الإلغاء
                  </span>
                )}
              </div>
            </div>

            {updateError && (
              <div className="p-2.5 rounded-[8px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{updateError}</span>
              </div>
            )}

            {updateSuccess && (
              <div className="p-2.5 rounded-[8px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{updateSuccess}</span>
              </div>
            )}

            {isTerminal ? (
              <p className="text-xs text-text-secondary bg-[#F6F1EA] p-3 rounded-[8px] border border-[#ECE6DD]">
                هذا الطلب وصل إلى حالة نهائية ({order.status === 'delivered' ? 'تم التسليم' : 'ملغي'})، ولا يمكن إجراء تعديلات أخرى على حالته.
              </p>
            ) : (
              <form onSubmit={handleStatusUpdate} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    الانتقال للحالة التالية:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 rounded-[8px] border border-[#ECE6DD] text-xs bg-white focus:outline-hidden focus:border-accent"
                    required
                  >
                    <option value="">اختر الحالة الجديدة...</option>
                    {allowedNext.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    ملاحظة داخلية (اختياري):
                  </label>
                  <textarea
                    rows={2}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="مثال: تم التأكيد هاتفياً، رقم بوليصة الشحن 123456..."
                    className="w-full px-3 py-2 rounded-[8px] border border-[#ECE6DD] text-xs focus:outline-hidden focus:border-accent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating || !newStatus}
                  className="w-full py-2.5 px-3 rounded-[8px] bg-accent text-white text-xs font-bold hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {updating ? 'جارٍ الحفظ...' : 'تأكيد تغيير الحالة'}
                </button>
              </form>
            )}
          </div>

          {/* Status History Timeline */}
          <div className="bg-white rounded-[10px] border border-[#ECE6DD] p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold font-tajawal text-text-primary flex items-center gap-2 border-b border-[#ECE6DD] pb-2">
              <FileText className="w-4 h-4 text-accent" />
              <span>سجل الحركات والتغييرات الزمني</span>
            </h2>

            <div className="space-y-3">
              {order.history.map((hist, idx) => (
                <div key={idx} className="relative pr-4 border-r-2 border-accent text-xs space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-text-primary">
                    <span>حالة: {hist.status}</span>
                    <span className="text-[10px] text-text-secondary font-mono">
                      {new Date(hist.changedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary">بواسطة: {hist.changedBy}</p>
                  {hist.note && (
                    <p className="text-xs bg-[#F6F1EA] p-1.5 rounded text-text-primary mt-1">
                      {hist.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

