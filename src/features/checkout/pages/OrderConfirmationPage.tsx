import { useLocation, Link, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { CheckCircle2, MessageCircle, Search, ArrowRight, Package } from 'lucide-react'
import type { OrderConfirmation } from '@/services/api/schemas/order'
import { siteConfig } from '@/app/config/site'
import { storage } from '@/shared/lib/storage'

export default function OrderConfirmationPage() {
  const location = useLocation()
  const order = location.state?.order as OrderConfirmation | undefined

  // If no state, check if there is a recently submitted order number in storage
  const lastOrder = storage.lastOrder.get()

  if (!order && !lastOrder) {
    return <Navigate to="/" replace />
  }

  const orderNumber = order ? order.orderNumber : lastOrder?.orderNumber ?? ''
  const total = order ? order.total : undefined

  // Prefilled WhatsApp confirmation message
  const whatsappText = encodeURIComponent(
    `مرحباً عزاب موتو، أود تأكيد طلبي برقم: ${orderNumber}${
      total ? ` بقيمة إجمالية: ${total} ج.م` : ''
    }. شكراً لكم!`,
  )
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${whatsappText}`

  return (
    <div className="min-h-screen bg-base py-12 sm:py-16">
      <Helmet>
        <title>تم استلام طلبك بنجاح | عزاب موتو</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="container mx-auto px-4 max-w-2xl">
        <div className="rounded-[10px] border border-border bg-surface p-8 sm:p-10 text-center shadow-xs">
          {/* Success Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <h1 className="mt-5 font-heading text-2xl font-black text-heading sm:text-3xl">
            تم تسجيل طلبك بنجاح!
          </h1>

          <p className="mt-2 text-sm text-secondary leading-relaxed max-w-lg mx-auto">
            شكراً لثقتك في عزاب موتو. تم إرسال تفاصيل طلبك إلى قسم التجهيز، وسيتواصل معك مندوبنا هاتفياً لتأكيد موعد التسليم.
          </p>

          {/* Prominent Order Number Card */}
          <div className="my-6 rounded-[10px] border border-accent/20 bg-accent/5 p-4 sm:p-5 max-w-md mx-auto">
            <span className="block text-xs font-semibold text-secondary mb-1">
              رقم تتبع الطلب الخاص بك:
            </span>
            <span className="font-numeric tabular text-2xl sm:text-3xl font-black text-accent tracking-wider select-all">
              {orderNumber}
            </span>
            <p className="mt-2 text-[11px] text-secondary">
              احتفظ برقم الطلب لمتابعة حالة شحنته في أي وقت.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {/* Primary Button: Track Order */}
            <Link
              to={`/track?orderNumber=${encodeURIComponent(orderNumber)}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[10px] bg-accent px-6 py-3.5 font-heading text-sm font-bold text-white shadow-xs hover:bg-accent-hover transition cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span>تابع طلبك الآن</span>
            </Link>

            {/* Secondary Button: WhatsApp Confirmation */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[10px] border border-border bg-base px-6 py-3.5 font-heading text-sm font-semibold text-heading hover:bg-neutral-light transition"
            >
              <MessageCircle className="h-4 w-4 text-accent" />
              <span>تأكيد عبر واتساب</span>
            </a>
          </div>

          {/* Order Details (if available from state) */}
          {order && (
            <div className="mt-8 border-t border-border pt-6 text-right">
              <h2 className="text-sm font-bold text-heading mb-3 flex items-center gap-1.5">
                <Package className="h-4 w-4 text-accent" />
                <span>محتويات الطلب:</span>
              </h2>

              <div className="divide-y divide-border rounded-[8px] border border-border bg-base p-3 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-2">
                    <span className="text-heading font-medium">
                      {item.productName} <span className="text-secondary font-numeric tabular">× {item.quantity}</span>
                    </span>
                    <span className="font-numeric tabular font-bold text-heading">
                      {item.price} ج.م
                    </span>
                  </div>
                ))}

                <div className="flex justify-between pt-2.5 font-bold text-sm">
                  <span className="text-heading">المجموع الإجمالي (دفع عند الاستلام):</span>
                  <span className="font-numeric tabular text-accent text-base">{order.total} ج.م</span>
                </div>
              </div>

              <div className="mt-3 text-xs text-secondary leading-relaxed">
                <span>عنوان التوصيل: {order.customer.address}، {order.customer.city}، {order.customer.governorate}</span>
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-border pt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-heading transition"
            >
              <span>العودة للصفحة الرئيسية</span>
              <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

