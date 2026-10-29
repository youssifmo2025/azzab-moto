import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, ChevronLeft, ShieldCheck, Truck, Sparkles, ChevronDown } from 'lucide-react'

export function HeroSection() {
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setHasScrolled(true)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      aria-label="واجهة المتجر الرئيسية"
      className="relative w-full min-h-[calc(100svh-4rem)] sm:min-h-[calc(100svh-4.5rem)] flex items-center bg-[#1c1c1c] overflow-hidden"
    >
      {/* ── Full-Bleed TVS Apache RR 310 Showroom Photography Background Layer ── */}
      <div
        className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
        aria-hidden="true"
      >
        <picture>
          <source srcSet="/images/hero-motorcycle.webp" type="image/webp" />
          <img
            src="/images/hero-motorcycle.jpg"
            alt="دراجة TVS Apache RR 310 الأصلية في صالة عرض عزاب موتو"
            width={1376}
            height={768}
            fetchPriority="high"
            loading="eager"
            className="h-full w-full object-cover object-[35%_center] sm:object-center animate-hero-bg animate-hero-ambient"
          />
        </picture>

        {/* ── Directional Contrast Overlay ──
            - Desktop: Charcoal (#2B2B2B) gradient from RIGHT edge in RTL (~75% opacity fading to 0% at ~55% width)
                       keeps text fully WCAG AA compliant while motorcycle stays unobstructed on the left.
            - Mobile: Bottom-to-top charcoal gradient so stacked text sits on solid dark charcoal. */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#222222] via-[#222222]/85 to-transparent sm:bg-gradient-to-l sm:from-[#2B2B2B]/90 sm:via-[#2B2B2B]/60 sm:to-transparent"
        />

        {/* Bottom edge gradient blending seamlessly into the warm vehicle selector section (#F6F1EA) */}
        <div
          className="absolute bottom-0 inset-x-0 h-16 sm:h-20 bg-gradient-to-b from-transparent to-[#F6F1EA]"
        />

        {/* Discrete showroom model badge in corner */}
        <span className="hidden md:inline-flex absolute bottom-8 end-8 text-[11px] font-medium text-white/50 tracking-wider font-numeric tabular">
          TVS Apache RR 310 · صالة العرض الرسمية
        </span>
      </div>

      {/* ── Hero Foreground Content (RTL Right-Aligned Single Column) ── */}
      <div className="container relative mx-auto px-4 py-16 sm:py-20 lg:py-24 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Text Column (Takes 60% on desktop, RTL start / right side) */}
          <div className="lg:col-span-7 xl:col-span-7">
            {/* Dealer Trust Pill */}
            <div className="reveal-line-1 mb-4 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-black/40 px-3.5 py-1 text-xs font-bold text-accent shadow-2xs backdrop-blur-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
              <span>وكيل معتمد TVS مصر · قطع غيار أصلية 100%</span>
            </div>

            {/* Headline — warm white #FFFDF9 with TVS orange accent line #FF8200 */}
            <h1 className="reveal-line-2 font-heading text-3xl font-extrabold leading-[1.2] text-[#FFFDF9] sm:text-4xl lg:text-5xl">
              قطع غيار TVS الأصلية
              <br />
              <span className="text-accent">لكل موديل</span> في مصر
            </h1>

            {/* Paragraph — max-width 60ch, 17-18px, line-height 1.8 */}
            <p className="reveal-paragraph mt-4 max-w-[60ch] text-[17px] sm:text-[18px] leading-[1.8] text-[#FFFDF9]/85 font-medium">
              الكتالوج الرسمي المعتمد لدراجات TVS النارية في مصر. فرامل، فلاتر، بطاريات، محركات،
              وزيوت TRU4 الأصلية — بضمان المصنع المباشر والشحن السريع لجميع المحافظات والدفع عند
              الاستلام بعد المعاينة.
            </p>

            {/* Single Slim Trust Strip (light tones on dark overlay) */}
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold text-white/80">
              <span className="reveal-trust-1 inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" />
                <span>مطابقة ميكانيكية 100%</span>
              </span>
              <span className="text-white/30 hidden sm:inline">·</span>
              <span className="reveal-trust-2 inline-flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-accent" aria-hidden="true" />
                <span>معاينة قبل الدفع والاستلام</span>
              </span>
              <span className="text-white/30 hidden sm:inline">·</span>
              <span className="reveal-trust-3 inline-flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
                <span>توصيل لكافة المحافظات</span>
              </span>
            </div>

            {/* CTA Buttons (Primary: Orange filled with lift + sweep; Secondary: Warm-white outline) */}
            <div className="reveal-ctas mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
              <Link
                to="/catalog"
                className="btn-primary px-6 py-3.5 text-sm sm:text-base cursor-pointer shadow-md"
              >
                <ShoppingBag className="h-4 w-4 me-2" aria-hidden="true" />
                <span>تصفح الكتالوج الرسمي</span>
              </Link>
              <a
                href="#vehicle-selector"
                className="btn-secondary-outline px-6 py-3.5 text-sm sm:text-base cursor-pointer"
              >
                <span>تحديد موديل دراجتك</span>
                <ChevronLeft className="h-4 w-4 ms-2 btn-icon-nudge text-white/80" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Gentle Scroll Cue (Disappears on scroll) */}
      {!hasScrolled && (
        <a
          href="#vehicle-selector"
          aria-label="الانتقال إلى محدد الدراجات"
          className="animate-scroll-cue absolute bottom-4 start-1/2 -translate-x-1/2 z-10 flex flex-col items-center text-white/60 hover:text-white transition-opacity duration-300"
        >
          <span className="text-[10px] font-medium tracking-widest uppercase mb-1">استكشف</span>
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
    </section>
  )
}
