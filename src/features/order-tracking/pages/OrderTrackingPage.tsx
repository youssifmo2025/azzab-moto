import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  MessageCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { activeOrderRepository } from '@/services'
import type { OrderLookupResult, OrderStatus } from '@/services/api/schemas/order'
import { storage } from '@/shared/lib/storage'
import { siteConfig } from '@/app/config/site'

const STATUS_STEPS: Array<{ key: OrderStatus; label: string; desc: string }> = [
  { key: 'new', label: 'تم الاستلام', desc: 'تم استلام طلبك وبانتظار المراجعة' },
  { key: 'processing', label: 'قيد التجهيز', desc: 'جاري فحص وتغليف قطع الغيار' },
  { key: 'shipped', label: 'تم الشحن', desc: 'الطلب في الطريق إليك مع شركة الشحن' },
  { key: 'delivered', label: 'تم التسليم', desc: 'تم تسليم الطلب وتحصيل المبلغ' },
]

function getStepIndex(status: OrderStatus): number {
  switch (status) {
    case 'new':
      return 0
    case 'processing':
      return 1
    case 'shipped':
      return 2
    case 'delivered':
      return 3
    case 'cancelled':
      return -1
  }
}

export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams()

  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderResult, setOrderResult] = useState<OrderLookupResult | null>(null)

  // Initialize with query params or storage
  useEffect(() => {
    const paramNum = searchParams.get('orderNumber')
    if (paramNum) {
      setOrderNumber(paramNum.trim().toUpperCase())
    } else {
      const lastOrder = storage.lastOrder.get()
      if (lastOrder?.orderNumber) {
        setOrderNumber(lastOrder.orderNumber)
      }
    }
  }, [searchParams])

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setOrderResult(null)

    const cleanNumber = orderNumber.trim().toUpperCase()
    const cleanPhone = phone.trim()

    if (!cleanNumber) {
      setError('يرجى إدخال رقم الطلب')
      return
    }

    const egyptianPhoneRegex = /^01[0125][0-9]{8}$/
    if (!cleanPhone || !egyptianPhoneRegex.test(cleanPhone)) {
      setError('يرجى إدخال رقم هاتف محمول مصري صحيح مكون من 11 رقماً (مثال: 01012345678)')
      return
    }

    setIsLoading(true)

    try {
      const result = await activeOrderRepository.lookupOrder(cleanNumber, cleanPhone)
      setOrderResult(result)
    } catch (err: unknown) {
      const errObj = err as { status?: number; message?: string }
      if (errObj?.status === 429) {
        setError('تم تجاوز الحد المسموح من المحاولات. يرجى المحاولة بعد قليل.')
      } else {
        setError('رقم الطلب أو رقم الهاتف غير مطابق لبيانات مسجلة لدينا')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const currentStep = orderResult ? getStepIndex(orderResult.status) : 0
  const isCancelled = orderResult?.status === 'cancelled'

  const whatsappInquiryUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `السلام عليكم، أستفسر بخصوص طلبي رقم: ${orderResult?.orderNumber ?? orderNumber}`,
  )}`

  return (
    <div className="min-h-screen bg-base py-8 sm:py-12">
      <Helmet>
        <title>تتبع حالة الطلب | عزاب موتو</title>
        <meta
          name="description"
          content="تابع مسار وتفاصيل شحن طلبك من عزاب موتو لقطع غيار TVS الأصلية برقم الطلب ورقم الهاتف."
        />
      </Helmet>

      <div className="container mx-auto px-4 max-w-3xl">
        {/* Breadcrumb */}
        <nav aria-label="مسار التنقل" className="mb-6 flex items-center gap-2 text-xs text-secondary">
          <Link to="/" className="hover:text-heading">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-heading font-medium" aria-current="page">
            تتبع الطلب
          </span>
        </nav>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent mb-3">
            <Package className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-heading font-heading">
            تتبع حالة شحنتك
          </h1>
          <p className="mt-2 text-sm text-secondary max-w-md mx-auto">
            أدخل رقم الطلب ورقم الهاتف المسجل لمتابعة خط سير الشحنة لحظة بلحظة.
          </p>
        </div>

        {/* Lookup Form */}
        <div className="rounded-[10px] border border-border bg-surface p-6 sm:p-8 shadow-xs mb-8">
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Order Number */}
              <div>
                <label htmlFor="orderNumber" className="block text-xs font-semibold text-heading mb-1.5">
                  رقم الطلب <span className="text-danger">*</span>
                </label>
                <input
                  id="orderNumber"
                  type="text"
                  dir="ltr"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  placeholder="AZ-202610-XXXX"
                  className="w-full text-right rounded-[8px] border border-border bg-base px-3.5 py-2.5 text-sm font-numeric tabular uppercase text-heading placeholder:text-secondary/60 focus:outline-hidden focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-heading mb-1.5">
                  رقم الهاتف المسجل بالطلب <span className="text-danger">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full text-right rounded-[8px] border border-border bg-base px-3.5 py-2.5 text-sm font-numeric tabular text-heading placeholder:text-secondary/60 focus:outline-hidden focus:ring-2 focus:ring-accent"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-[8px] border border-danger/40 bg-danger/10 p-3.5 text-xs text-danger flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-[10px] bg-accent py-3 font-heading text-sm font-bold text-white shadow-xs hover:bg-accent-hover transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جاري البحث عن الطلب...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>استعلام عن حالة الطلب</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Details & Timeline Display */}
        {orderResult && (
          <div className="space-y-6">
            {/* Status Timeline Card */}
            <div className="rounded-[10px] border border-border bg-surface p-6 sm:p-8 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 mb-6">
                <div>
                  <span className="text-xs text-secondary font-medium block">بيانات الطلب</span>
                  <span className="font-numeric tabular text-xl font-black text-heading">
                    {orderResult.orderNumber}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isCancelled ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-3 py-1 text-xs font-bold text-danger">
                      <XCircle className="h-3.5 w-3.5" />
                      <span>تم إلغاء الطلب</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{STATUS_STEPS[currentStep]?.label ?? orderResult.status}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Cancelled Notice */}
              {isCancelled ? (
                <div className="rounded-[8px] border border-danger/30 bg-danger/5 p-4 text-xs text-danger space-y-1">
                  <p className="font-bold text-sm">تم إلغاء هذا الطلب</p>
                  <p className="text-secondary leading-relaxed">
                    تم إلغاء هذا الطلب بناءً على طلبكم أو لتعذر تأكيد بيانات الشحن. إذا كان لديكم أي استفسار، يرجى التواصل مع الدعم الفني.
                  </p>
                </div>
              ) : (
                /* Stepper Timeline */
                <div className="py-4">
                  <div className="relative">
                    {/* Connecting line */}
                    <div className="absolute top-5 start-6 end-6 h-0.5 bg-border hidden sm:block" />

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-2">
                      {STATUS_STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStep
                        const isCurrent = idx === currentStep

                        return (
                          <div
                            key={step.key}
                            className="relative flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2"
                          >
                            <div
                              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                                isCompleted
                                  ? 'bg-accent text-white shadow-xs'
                                  : 'border-2 border-border bg-base text-secondary'
                              } ${isCurrent ? 'ring-4 ring-accent/20' : ''}`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <span className="font-numeric tabular">{idx + 1}</span>
                              )}
                            </div>

                            <div className="flex-1 sm:flex-initial">
                              <h3
                                className={`text-xs font-bold ${
                                  isCompleted ? 'text-heading' : 'text-secondary'
                                }`}
                              >
                                {step.label}
                              </h3>
                              <p className="text-[11px] text-secondary mt-0.5 hidden sm:block">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Order Info Summary */}
              <div className="mt-8 pt-6 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-secondary block mb-1">المجموع الكلي:</span>
                  <span className="font-numeric tabular text-sm font-extrabold text-accent">
                    {orderResult.total} ج.م
                  </span>
                </div>
                <div>
                  <span className="text-secondary block mb-1">طريقة الدفع:</span>
                  <span className="font-semibold text-heading">دفع عند الاستلام</span>
                </div>
                <div>
                  <span className="text-secondary block mb-1">محافظة التسليم:</span>
                  <span className="font-semibold text-heading">{orderResult.governorate}</span>
                </div>
                <div>
                  <span className="text-secondary block mb-1">تاريخ الطلب:</span>
                  <span className="font-numeric tabular text-secondary">
                    {new Date(orderResult.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Assistance Card */}
            <div className="rounded-[10px] border border-border bg-surface p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-right">
                <div className="rounded-full bg-accent/10 p-2 text-accent shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-heading">هل تود تعديل موعد الاستلام أو الاستفسار؟</h4>
                  <p className="text-[11px] text-secondary">
                    فريق خدمة عملاء عزاب موتو جاهز لمساعدتك مباشرة عبر واتساب.
                  </p>
                </div>
              </div>

              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[8px] border border-border bg-base px-4 py-2 text-xs font-semibold text-heading hover:bg-neutral-light transition shrink-0"
              >
                <MessageCircle className="h-4 w-4 text-accent" />
                <span>تواصل عبر واتساب</span>
              </a>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-heading transition"
          >
            <span>العودة لكتالوج قطع الغيار</span>
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  )
}

