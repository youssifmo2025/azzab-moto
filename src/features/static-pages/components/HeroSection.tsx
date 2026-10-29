import { Link } from 'react-router-dom'
import { ShoppingBag, ChevronLeft } from 'lucide-react'
import heroImg from '@/assets/hero.png'

export function HeroSection() {
  return (
    <section aria-label="واجهة المتجر الرئيسية" className="bg-base overflow-hidden">
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Right half — headline and CTAs */}
          <div className="order-2 lg:order-1 animate-fade-in-up">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent stagger-1">
              قطع غيار أصلية · مصر
            </p>
            <h1 className="font-heading text-3xl font-extrabold leading-snug text-heading sm:text-4xl lg:text-5xl stagger-2">
              قطع غيار TVS الأصلية
              <br />
              <span className="text-accent">لكل موديل</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-body stagger-3">
              تشكيلة متكاملة من قطع الغيار المعتمدة — فرامل، فلاتر، بطاريات، وزيوت TRU4 — مع التوصيل
              لجميع المحافظات والدفع عند الاستلام.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4 stagger-4">
              <Link
                to="/catalog"
                className="btn-press inline-flex items-center gap-2 rounded-[10px] bg-accent px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-accent-hover cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                <span>تسوق القطع</span>
              </Link>
              <a
                href="#vehicle-selector"
                className="btn-press inline-flex items-center gap-2 rounded-[10px] border border-border bg-surface px-6 py-3 text-sm font-semibold text-heading shadow-xs transition hover:bg-alt cursor-pointer"
              >
                <span>اختار موتوسيكلك</span>
                <ChevronLeft className="h-4 w-4 text-secondary" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Left half — motorcycle photo on sand background */}
          <div className="order-1 lg:order-2 animate-fade-in">
            <div className="relative overflow-hidden rounded-[16px] bg-alt shadow-sm transition duration-300 hover:shadow-md">
              <img
                src={heroImg}
                alt="دراجة TVS نارية أصلية على خلفية رملية فاتحة"
                width={560}
                height={420}
                className="h-auto w-full object-cover transition duration-500 hover:scale-[1.02]"
                // Hero image is above the fold — must NOT be lazy loaded
              />
              <p className="absolute bottom-3 end-3 rounded-full bg-surface/90 px-3 py-1 text-xs font-medium text-body backdrop-blur-xs shadow-2xs">
                TVS HLX 150
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
