import { Helmet } from 'react-helmet-async'
import { AlertCircle, RotateCcw, Truck, CheckCircle2 } from 'lucide-react'
import { siteConfig } from '@/app/config/site'

export default function ReturnsPage() {
  return (
    <>
      <Helmet>
        <title>{`سياسة الشحن والاسترجاع — ${siteConfig.name}`}</title>
        <meta
          name="description"
          content="سياسة الشحن، التوصيل، والاستبدال والاسترجاع لقطع غيار TVS في متجر عزاب موتو"
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
              شروط الشحن والاسترجاع والمدد المذكورة أدناه هي نماذج مقترحة للعرض وتخضع لسياسة متجر
              عزاب موتو الفعلية مع شركات الشحن المعتمدة لديه.
            </p>
          </div>
        </div>

        <h1 className="font-heading text-3xl font-extrabold text-heading sm:text-4xl">
          سياسة الشحن والاسترجاع
        </h1>
        <p className="mt-2 text-sm text-secondary">
          شروط واضحة تضمن حق العميل وتوفر راحة البال عند الشراء
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-body">
          {/* Shipping Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="font-heading text-xl font-bold text-heading">
                1. سياسة الشحن والتوصيل
              </h2>
            </div>
            <p>
              نوفر خدمة الشحن لجميع محافظات جمهورية مصر العربية بنظام{' '}
              <strong>الدفع عند الاستلام</strong> (COD) بعد فتح الطرد ومعاينة القطع والتأكد من
              مطابقتها لكود الصنف.
            </p>
            <ul className="space-y-2 pe-4">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success mt-0.5" aria-hidden="true" />
                <span>
                  <strong>القاهرة والجيزة:</strong> يتم التوصيل خلال 24 إلى 48 ساعة عمل.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success mt-0.5" aria-hidden="true" />
                <span>
                  <strong>محافظات الوجه البحري والقناة:</strong> يتم التوصيل خلال 2 إلى 3 أيام عمل.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success mt-0.5" aria-hidden="true" />
                <span>
                  <strong>محافظات الصعيد والمحافظات الحدودية:</strong> يتم التوصيل خلال 3 إلى 4 أيام
                  عمل.
                </span>
              </li>
            </ul>
          </section>

          {/* Returns Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="font-heading text-xl font-bold text-heading">
                2. شروط الاستبدال والاسترجاع
              </h2>
            </div>
            <p>
              يحق للعميل طلب استبدال أو إرجاع قطعة الغيار خلال <strong>14 يوماً</strong> من تاريخ
              الاستلام وفق الضوابط التالية:
            </p>
            <ul className="list-inside list-disc space-y-2 pe-2 text-heading">
              <li>أن تكون القطعة في حالتها الأصلية الجديدة وغير مستخدمة أو مركبة على المحرك.</li>
              <li>
                وجود الغلاف الكرتوني الأصلي لشركة TVS مع عدم إتلاف أو تمزيق الملصق المحتوي على
                باركود القطعة.
              </li>
              <li>
                القطع الكهربائية (مثل الملفات ووحدات الإشعال CDI) يتم فحصها بدقة للتأكد من عدم
                تعرضها لأي تيار كهربائي أو قفلة ناتجة عن عيب بضفيرة الموتوسيكل.
              </li>
              <li>
                في حالة وجود عيب مصنعي أو خطأ في إرسال القطعة يتحمل المتجر كافة مصاريف الشحن ذهاباً
                وإياباً.
              </li>
            </ul>
          </section>

          {/* How to request */}
          <section className="rounded-[10px] border border-border bg-surface p-5">
            <h2 className="font-heading text-base font-bold text-heading">
              خطوات تقديم طلب الاسترجاع:
            </h2>
            <p className="mt-2 text-xs text-body">
              تواصل معنا مباشرة عبر واتساب على الرقم{' '}
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-accent hover:underline"
              >
                {siteConfig.whatsappDisplay}
              </a>{' '}
              مع إرسال صورة البوليصة وصورة القطعة وتوضيح سبب الطلب، وسيتم الرد عليك فوراً لترتيب
              مندوب الشحن.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
