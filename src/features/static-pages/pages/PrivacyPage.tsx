import { Helmet } from 'react-helmet-async'
import { AlertCircle } from 'lucide-react'
import { siteConfig } from '@/app/config/site'

export default function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>{`سياسة الخصوصية — ${siteConfig.name}`}</title>
        <meta
          name="description"
          content="سياسة الخصوصية وحماية بيانات الزوار والعملاء في متجر عزاب موتو لقطع غيار TVS"
        />
      </Helmet>

      <div className="container mx-auto max-w-3xl px-4 py-10 sm:py-14">
        {/* Placeholder Warning Banner */}
        <div className="mb-8 flex items-start gap-3 rounded-[10px] border border-warning/40 bg-promo/60 p-4 text-xs text-heading">
          <AlertCircle className="h-5 w-5 shrink-0 text-accent-text mt-0.5" aria-hidden="true" />
          <div>
            <strong className="block font-bold text-accent-text">
              [نص تجريبي مؤقت — يتطلب مراجعة واعتماد العميل قبل النشر النهائي]
            </strong>
            <p className="mt-0.5 text-body">
              بنود سياسة الخصوصية الموضحة أدناه هي مسودة استرشادية للعرض ويجب مراجعتها وتعديلها
              بمعرفة المستشار القانوني أو إدارة متجر عزاب موتو.
            </p>
          </div>
        </div>

        <h1 className="font-heading text-3xl font-extrabold text-heading sm:text-4xl">
          سياسة الخصوصية
        </h1>
        <p className="mt-2 text-sm text-secondary">آخر تحديث: أكتوبر 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-body">
          <p>
            نحن في متجر <strong>عزاب موتو (AZZAB MOTO)</strong> نلتزم بأعلى معايير الشفافية والأمان
            في الحفاظ على خصوصية بيانات عملائنا وزوارنا الكرام.
          </p>

          <h2 className="pt-2 font-heading text-xl font-bold text-heading">
            1. طبيعة البيانات في المتجر
          </h2>
          <p>
            في إطار الباقة التأسيسية (Starter Store)، لا يتطلب الموقع إنشاء حسابات شخصية أو إدخال
            بطاقات ائتمانية. تتم جميع استفسارات الشراء والطلبات بشكل مشفر ومباشر عبر تطبيق واتساب
            لضمان خصوصيتكم وراحتكم.
          </p>

          <h2 className="pt-2 font-heading text-xl font-bold text-heading">
            2. التخزين المحلي (LocalStorage)
          </h2>
          <p>
            يستخدم موقعنا تقنية التخزين المحلي للمتصفح لحفظ التفضيلات التشغيلية المؤقتة فقط (مثل
            تذكر آخر عملية بحث أو عدد مرات تصفح المتجر لعرض إشعار إضافة الموقع للشاشة الرئيسية)، ولا
            يتم تخزين أي بيانات سرية أو معرفات تتبع شخصية.
          </p>

          <h2 className="pt-2 font-heading text-xl font-bold text-heading">
            3. سرية المحادثات والطلبات
          </h2>
          <p>
            تقتصر معلومات التواصل المرسلة عبر واتساب (الاسم، العنوان، رقم الهاتف، صور القطع
            المطلوبة) على إتمام عملية تجهيز وشحن الطلب ومتابعة التوصيل فقط، ولا تتم مشاركتها أو
            بيعها لأي جهة تسويقية خارجية بأي شكل.
          </p>

          <h2 className="pt-2 font-heading text-xl font-bold text-heading">
            4. التواصل والتعديلات
          </h2>
          <p>
            إذا كان لديكم أي استفسار بخصوص سياسة الخصوصية، يمكنكم مراسلتنا دائماً عبر رقم خدمة
            العملاء المعتمد: {siteConfig.whatsappDisplay}.
          </p>
        </div>
      </div>
    </>
  )
}
