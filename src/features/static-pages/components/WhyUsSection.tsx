import { ShieldCheck, Truck, Clock, Award } from 'lucide-react'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'قطع غيار أصلية 100%',
    desc: 'مستوردة ومعتمدة من مصانع TVS بجودة وضمان المصنع.',
  },
  {
    icon: Truck,
    title: 'شحن لجميع المحافظات',
    desc: 'توصيل سريع وآمن حتى باب ورشتك أو منزلك أينما كنت.',
  },
  {
    icon: Clock,
    title: 'الدفع عند الاستلام',
    desc: 'عاين طلبيتك وتأكد من مطابقتها أولاً قبل دفع أي مبالغ.',
  },
  {
    icon: Award,
    title: 'دعم فني متخصص',
    desc: 'فريق هندسي يرشدك بدقة للقطعة المناسبة لموديل دراجتك.',
  },
]

export function WhyUsSection() {
  const ref = useScrollReveal<HTMLElement>()

  return (
    <section
      ref={ref}
      aria-labelledby="why-us-heading"
      className="border-t border-border bg-base py-16 sm:py-20"
    >
      <div className="container mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">ثقة وجودة</p>
          <h2
            id="why-us-heading"
            className="mt-1 font-heading text-2xl font-extrabold text-heading sm:text-3xl"
          >
            ليه تختار عزاب موتو؟
          </h2>
        </div>

        {/* 4 points in a single row without cards per design brief */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="group flex flex-col items-center text-center sm:items-start sm:text-start transition duration-200"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-border/80 text-secondary transition-all duration-200 group-hover:border-accent/40 group-hover:bg-promo group-hover:text-accent group-hover:shadow-xs mb-4">
                  <Icon className="h-6 w-6 transition-transform duration-200 group-hover:scale-105" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-base font-bold text-heading transition-colors duration-200 group-hover:text-accent">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-body">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
