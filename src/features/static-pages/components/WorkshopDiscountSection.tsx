import { Wrench, MessageCircle } from 'lucide-react'
import { buildWhatsAppUrl } from '@/shared/lib/whatsapp'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'

export function WorkshopDiscountSection() {
  const ref = useScrollReveal<HTMLElement>()
  const whatsappUrl = buildWhatsAppUrl(
    'السلام عليكم، أنا صاحب ورشة/مركز صيانة وأود الاستفسار عن خصومات الجملة والورش.',
  )

  return (
    <section
      ref={ref}
      aria-label="خصم خاص لأصحاب الورش ومراكز الصيانة"
      className="border-y border-accent/20 bg-promo py-8 sm:py-10"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row text-center sm:text-start">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface border border-accent/30 text-accent shadow-xs">
              <Wrench className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-extrabold text-heading sm:text-2xl">
                خصم خاص لأصحاب الورش ومراكز الصيانة
              </h2>
              <p className="mt-1 text-sm text-body">
                أسعار جملة وتوريد منتظم لقطع غيار TVS الأصلية مع شحن سريع لمحافظتك
              </p>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-[10px] bg-accent px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-accent-hover"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <span>تواصل بخصوص خصم الورش</span>
          </a>
        </div>
      </div>
    </section>
  )
}
