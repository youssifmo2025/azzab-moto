import { Helmet } from 'react-helmet-async'
import { AlertCircle, ShieldCheck, MapPin, Truck } from 'lucide-react'
import { siteConfig } from '@/app/config/site'

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>{`من نحن — ${siteConfig.name}`}</title>
        <meta
          name="description"
          content="تعرف على متجر عزاب موتو المتخصص في قطع غيار دراجات TVS النارية في مصر"
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
              المعلومات الواردة أدناه بخصوص تاريخ المتجر وأرقام السجل والسياسات هي نماذج استرشادية
              للعرض ويجب استبدالها بالبيانات الرسمية لمتجر عزاب موتو.
            </p>
          </div>
        </div>

        <h1 className="font-heading text-3xl font-extrabold text-heading sm:text-4xl">من نحن</h1>
        <p className="mt-2 text-sm text-accent-text font-semibold">{siteConfig.tagline}</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-body">
          <p>
            تأسس متجر <strong>عزاب موتو (AZZAB MOTO)</strong> ليكون الوجهة المتخصصة الأولى في توفير
            قطع غيار دراجات وموتوسيكلات TVS الهندية في السوق المصري بأعلى معايير الدقة والموثوقية.
          </p>

          <p>
            انطلاقاً من فهمنا لمتطلبات قائدي دراجات TVS وأصحاب ورش الصيانة، نوفر حلولاً متكاملة تشمل
            قطع محركات HLX 150، وموديلات أباتشي RTR الرياضية، واسكوتر جوبيتر وإن تورك، مع الحرص
            التام على تقديم القطع الأصلية المعتمدة التي تضمن سلامة المركبة وأطول عمر تشغيلي.
          </p>

          <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
            <div className="rounded-[10px] border border-border bg-surface p-4 text-center">
              <ShieldCheck className="mx-auto h-7 w-7 text-accent mb-2" aria-hidden="true" />
              <h2 className="font-heading text-sm font-bold text-heading">أصالة وجودة</h2>
              <p className="mt-1 text-xs text-body">فحص دقيق ومطابقة للأرقام الهندسية الأصلية</p>
            </div>

            <div className="rounded-[10px] border border-border bg-surface p-4 text-center">
              <Truck className="mx-auto h-7 w-7 text-accent mb-2" aria-hidden="true" />
              <h2 className="font-heading text-sm font-bold text-heading">شحن محافظات</h2>
              <p className="mt-1 text-xs text-body">توصيل سريع وآمن لجميع مدن وقرى مصر</p>
            </div>

            <div className="rounded-[10px] border border-border bg-surface p-4 text-center">
              <MapPin className="mx-auto h-7 w-7 text-accent mb-2" aria-hidden="true" />
              <h2 className="font-heading text-sm font-bold text-heading">خدمة الورش</h2>
              <p className="mt-1 text-xs text-body">عروض خاصة وتوريد منتظم لمراكز الصيانة</p>
            </div>
          </div>

          <h2 className="pt-4 font-heading text-xl font-bold text-heading">رؤيتنا</h2>
          <p>
            تسهيل حصول كل مالك وفني على قطعة الغيار الصحيحة بأقل جهد ووقت، مع توفير شفافية كاملة في
            الأسعار واستشارات فنية مباشرة ومجانية قبل الشراء.
          </p>
        </div>
      </div>
    </>
  )
}
