import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Truck, RefreshCw, AlertTriangle } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    removeItem,
    updateQuantity,
    clearCart,
    staleNotifications,
    acknowledgeStaleItems,
  } = useCart()

  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-base py-8 sm:py-12">
      <Helmet>
        <title>سلة المشتريات | عزاب موتو</title>
        <meta name="description" content="راجع سلة المشتريات الخاصة بك وأكمل طلب قطع غيار TVS الأصلية بسهولة مع الدفع عند الاستلام." />
      </Helmet>

      <div className="container mx-auto px-4 max-w-5xl">
        {/* Breadcrumb */}
        <nav aria-label="مسار التنقل" className="mb-6 flex items-center gap-2 text-xs text-secondary">
          <Link to="/" className="text-btn text-btn-muted text-xs">الرئيسية</Link>
          <span>/</span>
          <span className="text-heading font-medium" aria-current="page">سلة المشتريات</span>
        </nav>

        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <h1 className="text-2xl font-black text-heading flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-accent" />
            <span>سلة المشتريات</span>
            <span className="text-sm font-normal text-secondary font-numeric tabular">({itemCount} قطع)</span>
          </h1>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-btn text-btn-muted text-xs hover:text-red-600 flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>إفراغ السلة</span>
            </button>
          )}
        </div>

        {/* Stale Notifications Alert */}
        {staleNotifications.length > 0 && (
          <div className="mb-6 rounded-[10px] border border-warning/40 bg-warning/10 p-4 text-sm text-warning-dark">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-heading">تنبيه بشأن محتويات سلتك:</p>
                <ul className="mt-1 list-disc list-inside space-y-1 text-xs">
                  {staleNotifications.map((n, idx) => (
                    <li key={idx}>
                      {n.reason === 'unavailable'
                        ? `القطعة (${n.productName}) لم تعد متوفرة في المخزن.`
                        : `تم تحديث سعر القطعة (${n.productName}) من ${n.oldPrice} إلى ${n.newPrice} ج.م`}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={acknowledgeStaleItems}
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-accent-hover transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>تحديث السلة والمتابعة بالأسعار الحالية</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="rounded-[10px] border border-border bg-surface p-12 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-light text-secondary">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-heading">سلة المشتريات فارغة</h2>
            <p className="mt-1 text-sm text-secondary">
              تصفح كتالوج قطع الغيار الأصلية وأضف القطع المناسبة لدراجتك النارية.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/catalog')}
                className="inline-flex items-center gap-2 rounded-[10px] bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-accent-hover transition"
              >
                <span>تصفح الكتالوج</span>
                <ArrowRight className="h-4 w-4 rotate-180" />
              </button>
              <Link
                to="/"
                className="rounded-[10px] border border-border bg-base px-5 py-2.5 text-sm font-semibold text-heading hover:bg-neutral-light transition"
              >
                الرئيسية
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[10px] border p-4 bg-surface transition ${
                    item.isUnavailable ? 'border-danger/30 bg-danger/5 opacity-75' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-base flex items-center justify-center">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xs text-secondary">عزاب موتو</span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-heading">
                        {item.product ? item.product.name : 'منتج غير معروف'}
                      </h3>
                      {item.product?.sku && (
                        <p className="text-xs text-secondary font-numeric tabular mt-0.5">
                          SKU: {item.product.sku}
                        </p>
                      )}
                      {item.isUnavailable ? (
                        <span className="mt-1 inline-block text-xs font-semibold text-danger">
                          نفدت الكمية من المخزن
                        </span>
                      ) : (
                        <span className="mt-1 inline-block text-[11px] font-medium text-success">
                          متوفر وجاهز للشحن
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                    {/* Quantity Controls */}
                    <div className="flex items-center rounded-lg border border-border bg-base">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.isUnavailable}
                        className="p-1.5 text-secondary hover:text-heading disabled:opacity-50"
                        aria-label="تقليل الكمية"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold font-numeric tabular">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.isUnavailable}
                        className="p-1.5 text-secondary hover:text-heading disabled:opacity-50"
                        aria-label="زيادة الكمية"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-left font-numeric tabular min-w-[90px]">
                      <div className="text-base font-extrabold text-accent">
                        {(parseFloat(item.currentPrice) * item.quantity).toFixed(2)} ج.م
                      </div>
                      <div className="text-[11px] text-secondary">
                        {item.currentPrice} ج.م للقطعة
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="p-1.5 text-secondary hover:text-danger transition"
                      aria-label="حذف القطعة"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Card */}
            <div className="space-y-4">
              <div className="rounded-[10px] border border-border bg-surface p-5 space-y-4">
                <h2 className="text-base font-bold text-heading border-b border-border pb-3">
                  ملخص الطلب
                </h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-secondary">
                    <span>قيمة المنتجات:</span>
                    <span className="font-numeric tabular font-bold text-heading">{subtotal} ج.م</span>
                  </div>
                  <div className="flex justify-between text-secondary">
                    <span>الشحن:</span>
                    <span className="text-xs text-body">يُحسب عند إدخال العنوان</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between items-baseline">
                    <span className="font-bold text-heading">الإجمالي التقريبي:</span>
                    <span className="font-numeric tabular text-xl font-extrabold text-accent">{subtotal} ج.م</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="btn-press w-full rounded-[10px] bg-accent py-3.5 text-center font-heading text-sm font-bold text-white shadow-xs hover:bg-accent-hover transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>المتابعة لإتمام الطلب</span>
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </button>

                <div className="pt-2 text-center">
                  <p className="text-xs font-semibold text-secondary">
                    الدفع عند الاستلام (COD) متاح لجميع المحافظات
                  </p>
                </div>
              </div>

              {/* Guarantees */}
              <div className="rounded-[10px] border border-border bg-surface p-4 space-y-3 text-xs text-secondary">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
                  <span>قطع غيار أصلية TVS مضمونة 100%</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Truck className="h-4 w-4 text-accent shrink-0" />
                  <span>توصيل سريع ومعاينة قبل الاستلام</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

