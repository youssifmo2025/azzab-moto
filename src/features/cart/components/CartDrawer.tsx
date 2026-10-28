import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, Trash2, Plus, Minus, AlertTriangle, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    isDrawerOpen,
    setIsDrawerOpen,
    removeItem,
    updateQuantity,
    staleNotifications,
    acknowledgeStaleItems,
  } = useCart()

  const navigate = useNavigate()
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDrawerOpen, setIsDrawerOpen])

  // Lock body scroll when open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen])

  if (!isDrawerOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="سلة المشتريات"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 end-0 flex max-w-full pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-md transform bg-surface shadow-xl transition-transform duration-200 ease-in-out flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="text-lg font-bold text-heading">سلة المشتريات</h2>
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent font-numeric tabular">
                {itemCount}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="rounded-lg p-1.5 text-secondary hover:bg-neutral-light hover:text-heading transition"
              aria-label="إغلاق السلة"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Stale Notifications Alert */}
          {staleNotifications.length > 0 && (
            <div className="border-b border-warning/30 bg-warning/10 p-3 text-xs text-warning-dark">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-warning mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-heading">تحديث على السلة:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {staleNotifications.map((n, idx) => (
                      <li key={idx}>
                        {n.reason === 'unavailable'
                          ? `القطعة (${n.productName}) لم تعد متوفرة حالياً.`
                          : `تم تحديث سعر (${n.productName}) من ${n.oldPrice} إلى ${n.newPrice} ج.م`}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={acknowledgeStaleItems}
                    className="mt-1 text-[11px] font-bold text-accent underline hover:text-accent-hover cursor-pointer"
                  >
                    تحديث السلة والمتابعة
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-light text-secondary">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="mt-4 font-bold text-heading">سلتك فارغة</h3>
                <p className="mt-1 text-sm text-secondary">
                  لم تقم بإضافة أي قطع غيار إلى سلتك بعد.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false)
                    navigate('/catalog')
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-[10px] bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-accent-hover transition"
                >
                  <span>تصفح كتالوج القطع</span>
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.productId}
                  className={`flex gap-3 rounded-[10px] border p-3 transition ${
                    item.isUnavailable
                      ? 'border-danger/30 bg-danger/5 opacity-70'
                      : 'border-border bg-base'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-surface flex items-center justify-center">
                    {item.product?.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-[10px] text-secondary">عزاب موتو</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-heading line-clamp-2">
                          {item.product ? item.product.name : 'منتج غير معروف'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-secondary hover:text-danger transition p-1"
                          aria-label={`حذف ${item.product?.name ?? ''} من السلة`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {item.product?.sku && (
                        <p className="text-[10px] text-secondary font-numeric tabular mt-0.5">
                          SKU: {item.product.sku}
                        </p>
                      )}

                      {item.isUnavailable && (
                        <span className="inline-block mt-1 text-[10px] font-semibold text-danger">
                          غير متوفر حالياً
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Price */}
                      <div className="font-numeric tabular text-sm font-bold text-accent">
                        {item.currentPrice} ج.م
                        {item.isPriceChanged && (
                          <span className="mr-1.5 text-[10px] text-secondary line-through">
                            {item.savedPrice} ج.م
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center rounded-md border border-border bg-surface">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.isUnavailable}
                          className="p-1 text-secondary hover:text-heading disabled:opacity-50"
                          aria-label="تقليل الكمية"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold font-numeric tabular">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.isUnavailable}
                          className="p-1 text-secondary hover:text-heading disabled:opacity-50"
                          aria-label="زيادة الكمية"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Subtotal & Actions */}
          {items.length > 0 && (
            <div className="border-t border-border bg-surface p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary">إجمالي المنتجات:</span>
                <span className="font-numeric tabular text-lg font-extrabold text-heading">
                  {subtotal} ج.م
                </span>
              </div>
              <p className="text-[11px] text-secondary">
                * تكلفة الشحن تُحسب عند اختيار المحافظة في الخطوة التالية.
              </p>

              <div className="grid grid-cols-1 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false)
                    navigate('/checkout')
                  }}
                  className="w-full rounded-[10px] bg-accent py-3 font-heading text-sm font-bold text-white shadow-xs hover:bg-accent-hover transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>إتمام الطلب (الدفع عند الاستلام)</span>
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </button>

                <Link
                  to="/cart"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full text-center py-2 text-xs font-semibold text-secondary hover:text-heading transition"
                >
                  عرض صفحة السلة بالكامل
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

