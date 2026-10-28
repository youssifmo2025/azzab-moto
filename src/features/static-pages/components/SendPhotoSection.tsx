import { Camera, MessageCircle, CheckCircle2 } from 'lucide-react'
import { buildWhatsAppUrl, buildPhotoRequestMessage } from '@/shared/lib/whatsapp'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'

export function SendPhotoSection() {
  const ref = useScrollReveal<HTMLElement>()
  const whatsappUrl = buildWhatsAppUrl(buildPhotoRequestMessage())

  return (
    <section ref={ref} aria-labelledby="send-photo-heading" className="bg-alt py-14 sm:py-18">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Text & CTA */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-promo px-3 py-1 text-xs font-semibold text-accent">
              <Camera className="h-3.5 w-3.5" aria-hidden="true" />
              <span>خدمة التعرف على القطع</span>
            </span>
            <h2
              id="send-photo-heading"
              className="mt-3 font-heading text-2xl font-extrabold text-heading sm:text-3xl lg:text-4xl"
            >
              مش عارف اسم القطعة أو رقمها؟
            </h2>
            <p className="mt-4 text-base leading-relaxed text-body">
              صور القطعة القديمة بكاميرا موبايلك أو ابعتلنا صورة الموتوسيكل على واتساب، وفريقنا
              الفني هيحددلك القطعة الأصلية المطابقة وسعرها فوراً.
            </p>

            <ul className="mt-6 space-y-2.5 text-sm text-heading">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                <span>رد فني خلال دقائق من مهندسي صيانة TVS</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                <span>تأكيد التوافق بنسبة 100% قبل الشحن</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                <span>الدفع عند الاستلام بعد معاينة القطعة</span>
              </li>
            </ul>

            <div className="mt-8">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-[10px] bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-xs transition hover:bg-accent-hover"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                <span>ابعت صورة القطعة على واتساب</span>
              </a>
            </div>
          </div>

          {/* Visual Phone mockup with chat message representation */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm rounded-[24px] border-4 border-heading/10 bg-surface p-4 shadow-xl">
              <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center text-success font-bold text-xs">
                    TVS
                  </div>
                  <div>
                    <p className="text-xs font-bold text-heading">خدمة عملاء عزاب موتو</p>
                    <p className="text-[10px] text-success">متصل الآن</p>
                  </div>
                </div>
              </div>

              {/* Chat bubbles */}
              <div className="space-y-3 py-2 text-xs">
                <div className="rounded-[12px] rounded-se-xs bg-alt p-3 text-body max-w-[85%] me-auto">
                  <p>السلام عليكم، مش عارف اسم القطعة دي في موتوسيكل TVS أباتشي 160</p>
                </div>
                <div className="rounded-[12px] bg-promo/50 border border-border p-2 max-w-[85%] me-auto">
                  <div className="h-28 rounded-[8px] bg-alt flex items-center justify-center text-secondary/60">
                    <Camera className="h-8 w-8" aria-hidden="true" />
                  </div>
                </div>
                <div className="rounded-[12px] rounded-ss-xs bg-accent text-white p-3 max-w-[85%] ms-auto">
                  <p>
                    وعليكم السلام! دي طلمبة باكم فرامل أمامي أصلية متوفرة بمخزننا وجاهزة للشحن فوري.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
