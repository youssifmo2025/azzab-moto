import { Helmet } from 'react-helmet-async'
import {
  MessageCircle,
  Phone,
  MapPin,
  Camera,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { siteConfig } from '@/app/config/site'
import { buildWhatsAppUrl, buildPhotoRequestMessage } from '@/shared/lib/whatsapp'

export default function ContactPage() {
  const generalWhatsappUrl = buildWhatsAppUrl(
    'السلام عليكم، أود التواصل مع خدمة عملاء متجر عزاب موتو.',
  )
  const photoRequestWhatsappUrl = buildWhatsAppUrl(buildPhotoRequestMessage())

  return (
    <>
      <Helmet>
        <title>{`تواصل معنا — ${siteConfig.name}`}</title>
        <meta
          name="description"
          content="تواصل مع فريق عزاب موتو عبر واتساب أو الهاتف لطلب قطع غيار TVS الأصلية"
        />
      </Helmet>

      <div className="container mx-auto max-w-3xl px-4 py-10 sm:py-14">
        {/* Placeholder Warning */}
        <div className="mb-8 flex items-start gap-3 rounded-[10px] border border-warning/40 bg-promo/60 p-4 text-xs text-heading">
          <AlertCircle className="h-5 w-5 shrink-0 text-accent-text mt-0.5" aria-hidden="true" />
          <div>
            <strong className="block font-bold text-accent-text">
              [بيانات تجريبية مؤقتة — يرجى اعتماد أرقام وعناوين التواصل الرسمية]
            </strong>
            <p className="mt-0.5 text-body">
              رقم الواتساب الحالي (01141334668) معتمد للعرض والتجربة. سيتم تحديث العنوان التفصيلي
              ومواعيد العمل عند استلام البيانات النهائية.
            </p>
          </div>
        </div>

        <h1 className="font-heading text-3xl font-extrabold text-heading sm:text-4xl">
          تواصل معنا
        </h1>
        <p className="mt-2 text-sm text-body">
          فريق دعم عزاب موتو في خدمتكم للرد على استفسارات قطع الغيار والتوافق الميكانيكي.
        </p>

        {/* Send Part Photo Highlighted Box */}
        <div className="mt-8 rounded-[14px] border-2 border-accent/30 bg-surface p-6 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-promo text-accent">
              <Camera className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <span className="inline-block rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-bold text-accent mb-1">
                خدمة مجانية سريعة
              </span>
              <h2 className="font-heading text-lg font-bold text-heading sm:text-xl">
                مش عارف اسم القطعة؟ ابعت صورتها على واتساب
              </h2>
              <p className="mt-1 text-xs text-body leading-relaxed">
                إذا لم تكن متأكداً من اسم القطعة أو رقمها الفني، اضغط على الزر أدناه ليتم توجيهك إلى
                محادثة واتساب مجهزة، ثم أرفق صورة القطعة من خلال كاميرا الواتساب لمطابقتها فورياً.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[8px] bg-alt/60 p-3 text-xs text-body space-y-1.5">
            <p className="font-semibold text-heading">كيف تعمل هذه الخدمة؟</p>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" />
              <span>1. اضغط على زر الإرسال لفتح محادثة واتساب الرسمية</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" />
              <span>
                2. اضغط على رمز المرفقات 📎 أو الكاميرا 📷 داخل واتساب وأرفق صورة القطعة القديمة
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" />
              <span>3. سيرد عليك مهندس الصيانة برقم القطعة وسعرها ورابط تأكيد الطلب</span>
            </div>
          </div>

          <div className="mt-5">
            <a
              href={photoRequestWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-accent px-6 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-accent-hover sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>إرسال صورة القطعة عبر واتساب</span>
            </a>
          </div>
        </div>

        {/* Contact Cards Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* WhatsApp Direct */}
          <div className="rounded-[10px] border border-border bg-surface p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-promo text-accent">
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-heading">واتساب المبيعات</h3>
                <p className="text-xs text-body">استفسارات الأسعار والطلبات</p>
              </div>
            </div>
            <a
              href={generalWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-border bg-base px-4 py-2.5 text-xs font-semibold text-heading hover:bg-alt transition"
            >
              <span className="font-numeric tabular">{siteConfig.phone}</span>
              <span>(محادثة فورية)</span>
            </a>
          </div>

          {/* Phone Call */}
          <div className="rounded-[10px] border border-border bg-surface p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-alt text-secondary">
                <Phone className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-heading">الاتصال الهاتفي</h3>
                <p className="text-xs text-body">للتواصل المباشر في أوقات العمل</p>
              </div>
            </div>
            <a
              href={`tel:${siteConfig.phone}`}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-border bg-base px-4 py-2.5 text-xs font-semibold text-heading hover:bg-alt transition"
            >
              <span className="font-numeric tabular">{siteConfig.phone}</span>
            </a>
          </div>
        </div>

        {/* Operating Hours & Shipping Location */}
        <div className="mt-8 rounded-[10px] border border-border bg-surface p-6 space-y-4 text-xs text-body">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-secondary shrink-0" aria-hidden="true" />
            <div>
              <strong className="block text-heading">أوقات العمل واستقبال الطلبات:</strong>
              <span>
                يومياً من الساعة 9:00 صباحاً حتى الساعة 10:00 مساءً (الجمعة من 1:00 ظهراً)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-secondary shrink-0" aria-hidden="true" />
            <div>
              <strong className="block text-heading">التوزيع والشحن:</strong>
              <span>
                {siteConfig.address} — شحن فوري وتوصيل لجميع المحافظات والدفع عند الاستلام
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
