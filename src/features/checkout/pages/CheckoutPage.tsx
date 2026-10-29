import { useState, useId } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { useCart } from '@/features/cart/context/CartContext'
import { activeOrderRepository } from '@/services'
import { EGYPTIAN_GOVERNORATES, getShippingFeeForGovernorate } from '@/app/config/shipping'
import { storage } from '@/shared/lib/storage'

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export default function CheckoutPage() {
  const { items, subtotalNumber, clearCart } = useCart()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [governorate, setGovernorate] = useState<string>(EGYPTIAN_GOVERNORATES[0])
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [honeypot, setHoneypot] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const honeypotId = useId()

  const validItems = items.filter((i) => !i.isUnavailable)
  const shippingFeeNum = getShippingFeeForGovernorate(governorate)
  const totalNum = subtotalNumber + shippingFeeNum

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!fullName.trim() || fullName.trim().length < 3) {
      newErrors.fullName = 'الاسم بالكامل مطلوب (3 أحرف على الأقل)'
    }

    const cleanPhone = phone.trim()
    const egyptianPhoneRegex = /^01[0125][0-9]{8}$/
    if (!cleanPhone) {
      newErrors.phone = 'رقم الهاتف المحمول مطلوب'
    } else if (!egyptianPhoneRegex.test(cleanPhone)) {
      newErrors.phone = 'يرجى إدخال رقم هاتف محمول مصري صحيح مكون من 11 رقماً (مثال: 01012345678)'
    }

    if (!city.trim() || city.trim().length < 2) {
      newErrors.city = 'المدينة أو المركز مطلوب'
    }

    if (!address.trim() || address.trim().length < 8) {
      newErrors.address = 'العنوان بالتفصيل مطلوب (الشارع، رقم العمارة أو علامة مميزة)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    // Honeypot check
    if (honeypot) {
      console.warn('Bot submission prevented by honeypot')
      return
    }

    if (!validate()) {
      return
    }

    if (validItems.length === 0) {
      setServerError('سلة المشتريات فارغة أو لا تحتوي على قطع متوفرة حالياً')
      return
    }

    setIsSubmitting(true)

    try {
      const idempotencyKey = generateUUID()
      const orderPayload = {
        customer: {
          name: fullName.trim(),
          phone: phone.trim(),
          governorate,
          city: city.trim(),
          address: address.trim(),
          notes: notes.trim() || undefined,
        },
        items: validItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        honeypotField: honeypot || undefined,
      }

      const confirmation = await activeOrderRepository.createOrder(orderPayload, idempotencyKey)

      // Save order number ONLY in storage for tracking convenience (strictly NO PII)
      storage.lastOrder.set({
        orderNumber: confirmation.orderNumber,
        createdAt: confirmation.createdAt,
      })

      // Clear the cart
      clearCart()

      // Redirect to confirmation page with confirmation data in history state
      navigate('/order/confirmation', {
        state: { order: confirmation },
        replace: true,
      })
    } catch (err: unknown) {
      const errorObj = err as { message?: string; status?: number }
      if (errorObj?.status === 409 || errorObj?.message?.includes('409') || errorObj?.message?.includes('المخزن')) {
        setServerError('عذراً، نفدت كمية بعض القطع في سلتك أثناء إتمام الطلب. يرجى مراجعة السلة.')
      } else {
        setServerError(
          errorObj?.message || 'حدث خطأ أثناء تسجيل الطلب. يرجى المحاولة مرة أخرى أو التواصل معنا عبر واتساب.',
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-base py-16 text-center">
        <div className="container mx-auto px-4 max-w-md">
          <h1 className="text-xl font-bold text-heading">سلتك فارغة</h1>
          <p className="mt-2 text-sm text-secondary">
            لا يمكنك إتمام الطلب بدون إضافة قطع غيار إلى سلتك أولاً.
          </p>
          <Link
            to="/catalog"
            className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-accent-hover transition"
          >
            <span>تصفح كتالوج القطع</span>
            <ArrowRight className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base py-8 sm:py-12">
      <Helmet>
        <title>إتمام الطلب — الدفع عند الاستلام | عزاب موتو</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="container mx-auto px-4 max-w-5xl">
        {/* Breadcrumb */}
        <nav aria-label="مسار التنقل" className="mb-6 flex items-center gap-2 text-xs text-secondary">
          <Link to="/" className="hover:text-heading">الرئيسية</Link>
          <span>/</span>
          <Link to="/cart" className="hover:text-heading">سلة المشتريات</Link>
          <span>/</span>
          <span className="text-heading font-medium" aria-current="page">إتمام الطلب</span>
        </nav>

        <h1 className="text-2xl font-black text-heading mb-6">
          إتمام الطلب — الدفع عند الاستلام (COD)
        </h1>

        {serverError && (
          <div className="animate-fade-in-up mb-6 rounded-[10px] border border-error/40 bg-error/10 p-4 text-sm text-error flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">تعذر إتمام الطلب:</p>
              <p className="mt-0.5 text-xs">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Honeypot field (hidden from real users) */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor={honeypotId}>اترك هذا الحقل فارغاً</label>
            <input
              id={honeypotId}
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Customer Details Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Info Box */}
              <div className="rounded-[10px] border border-border bg-surface p-6 space-y-4">
                <h2 className="text-base font-bold text-heading border-b border-border pb-3">
                  بيانات العميل والمستلم
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label htmlFor="fullName" className="block text-xs font-semibold text-heading mb-1.5">
                      الاسم بالكامل <span className="text-error">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="مثال: أحمد محمد علي"
                      className={`input-field w-full rounded-[8px] border bg-base px-3.5 py-2.5 text-sm text-heading placeholder:text-secondary/60 ${
                        errors.fullName ? 'border-error input-error' : 'border-border'
                      }`}
                      required
                    />
                    {errors.fullName && (
                      <p className="field-error mt-1 text-xs text-error">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="sm:col-span-2">
                    <label htmlFor="phone" className="block text-xs font-semibold text-heading mb-1.5">
                      رقم الهاتف المحمول (مصر) <span className="text-error">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      className={`w-full text-right rounded-[8px] border bg-base px-3.5 py-2.5 text-sm font-numeric tabular text-heading placeholder:text-secondary/60 focus:outline-hidden focus:ring-2 focus:ring-accent ${
                        errors.phone ? 'border-error input-error' : 'border-border'
                      }`}
                      required
                    />
                    <p className="mt-1 text-[11px] text-secondary">
                      سيتصل بك مندوب الشحن لتأكيد ميعاد التوصيل على هذا الرقم.
                    </p>
                    {errors.phone && (
                      <p className="field-error mt-1 text-xs text-error">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Address Box */}
              <div className="rounded-[10px] border border-border bg-surface p-6 space-y-4">
                <h2 className="text-base font-bold text-heading border-b border-border pb-3">
                  عنوان التوصيل
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Governorate */}
                  <div>
                    <label htmlFor="governorate" className="block text-xs font-semibold text-heading mb-1.5">
                      المحافظة <span className="text-error">*</span>
                    </label>
                    <select
                      id="governorate"
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      className="input-field w-full rounded-[8px] border border-border bg-base px-3.5 py-2.5 text-sm text-heading cursor-pointer"
                    >
                      {EGYPTIAN_GOVERNORATES.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-xs font-semibold text-heading mb-1.5">
                      المدينة / المركز / الحي <span className="text-error">*</span>
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="مثال: المعادي / شبين الكوم"
                      className={`input-field w-full rounded-[8px] border bg-base px-3.5 py-2.5 text-sm text-heading placeholder:text-secondary/60 ${
                        errors.city ? 'border-error input-error' : 'border-border'
                      }`}
                      required
                    />
                    {errors.city && (
                      <p className="field-error mt-1 text-xs text-error">{errors.city}</p>
                    )}
                  </div>

                  {/* Detailed Address */}
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-xs font-semibold text-heading mb-1.5">
                      العنوان بالتفصيل <span className="text-error">*</span>
                    </label>
                    <input
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="اسم الشارع، رقم المبنى، رقم الشقة، علامة مميزة بجوارك"
                      className={`input-field w-full rounded-[8px] border bg-base px-3.5 py-2.5 text-sm text-heading placeholder:text-secondary/60 ${
                        errors.address ? 'border-error input-error' : 'border-border'
                      }`}
                      required
                    />
                    {errors.address && (
                      <p className="field-error mt-1 text-xs text-error">{errors.address}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <label htmlFor="notes" className="block text-xs font-semibold text-heading mb-1.5">
                      ملاحظات إضافية للتوصيل (اختياري)
                    </label>
                    <textarea
                      id="notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="مثال: الاستلام بعد الساعة 3 عصراً، أو الاتصال قبل الوصول بنصف ساعة"
                      className="input-field w-full rounded-[8px] border border-border bg-base px-3.5 py-2 text-sm text-heading placeholder:text-secondary/60 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Notice */}
              <div className="rounded-[10px] border border-border bg-surface p-5 flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-accent/10 p-2 text-accent">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-heading">طريقة الدفع: الدفع عند الاستلام (COD)</h3>
                  <p className="text-xs text-secondary mt-1 leading-relaxed">
                    ستقوم بالدفع نقداً لمندوب الشحن عند استلام الطرد ومعاينته. لا توجد أي مدفوعات إلكترونية مسبقة مطلوبة.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar Summary */}
            <div className="space-y-4">
              <div className="rounded-[10px] border border-border bg-surface p-5 space-y-4">
                <h2 className="text-base font-bold text-heading border-b border-border pb-3">
                  ملخص الطلب
                </h2>

                {/* Items preview */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {validItems.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex-1 truncate">
                        <span className="font-semibold text-heading truncate block">
                          {item.product?.name ?? 'منتج'}
                        </span>
                        <span className="text-secondary font-numeric tabular text-[11px]">
                          الكمية: {item.quantity} × {item.currentPrice} ج.م
                        </span>
                      </div>
                      <span className="font-numeric tabular font-bold text-heading">
                        {(parseFloat(item.currentPrice) * item.quantity).toFixed(2)} ج.م
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-secondary">
                    <span>قيمة المنتجات:</span>
                    <span className="font-numeric tabular font-bold text-heading">
                      {subtotalNumber.toFixed(2)} ج.م
                    </span>
                  </div>

                  <div className="flex justify-between text-secondary">
                    <span>مصاريف الشحن ({governorate}):</span>
                    <span className="font-numeric tabular font-bold text-heading">
                      {shippingFeeNum > 0 ? `${shippingFeeNum.toFixed(2)} ج.م` : 'مجاناً'}
                    </span>
                  </div>

                  <div className="border-t border-border pt-3 flex justify-between items-baseline">
                    <span className="font-extrabold text-heading">المجموع النهائي:</span>
                    <span className="font-numeric tabular text-2xl font-black text-accent">
                      {totalNum.toFixed(2)} ج.م
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-press w-full rounded-[10px] bg-accent py-3.5 text-center font-heading text-base font-bold text-white shadow-xs hover:bg-accent-hover transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>جاري تسجيل الطلب...</span>
                    </>
                  ) : (
                    <span>تأكيد الطلب الآن</span>
                  )}
                </button>

                <p className="text-[11px] text-center text-secondary">
                  بالضغط على "تأكيد الطلب"، فإنك توافق على شروط الخدمة وسياسة الاسترجاع الخاصة بعزاب موتو.
                </p>
              </div>

              {/* Security info */}
              <div className="rounded-[10px] border border-border bg-surface p-4 space-y-2.5 text-xs text-secondary">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
                  <span>معاينة القطع قبل الدفع والاستلام</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-accent shrink-0" />
                  <span>شحن سريع ومباشر حتى باب منزلك أو ورشتك</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
