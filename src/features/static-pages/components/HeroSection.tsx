import { Link } from 'react-router-dom'
import { ShoppingBag, ChevronLeft, ShieldCheck, Truck, Award, Sparkles } from 'lucide-react'
import heroMotorcycleImg from '@/assets/hero-motorcycle.jpg'
import logoImg from '@/assets/logo.png'

export function HeroSection() {
  return (
    <section
      aria-label="واجهة المتجر الرئيسية"
      className="relative bg-base overflow-hidden border-b border-border/60"
    >
      {/* Background Architectural Grid & Subtle Watermark */}
      <div
        className="absolute inset-0 pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        {/* Soft Radial Ambient Spotlight centered behind motorcycle stage */}
        <div className="absolute top-1/2 end-1/4 -translate-y-1/2 w-[620px] h-[420px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,130,0,0.12)_0%,rgba(246,241,234,0.7)_50%,transparent_75%)] blur-2xl" />

        {/* Brand Logo Watermark (restrained, 3% opacity, behind content) */}
        <img
          src={logoImg}
          alt=""
          className="absolute -top-12 -start-12 h-96 w-96 object-contain opacity-[0.03] grayscale invert pointer-events-none select-none"
        />

        {/* Minimal Engineering Lines Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(236,230,221,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(236,230,221,0.3)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_80%)] opacity-35" />
      </div>

      <div className="container relative mx-auto px-4 py-12 sm:py-16 lg:py-20 z-10">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Right Column (Text & Actions) - 6 cols on lg */}
          <div className="order-2 lg:order-1 lg:col-span-6 animate-fade-in-up">
            {/* Dealer Trust Pill */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-promo px-3.5 py-1 text-xs font-bold text-accent-text shadow-2xs">
              <Award className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              <span>وكيل معتمد TVS مصر · قطع غيار أصلية 100%</span>
            </div>

            <h1 className="font-heading text-3xl font-extrabold leading-[1.2] text-heading sm:text-4xl lg:text-5xl">
              قطع غيار TVS الأصلية
              <br />
              <span className="text-accent">لكل موديل في مصر</span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-body">
              الكتالوج الرسمي المعتمد لدراجات TVS النارية في مصر. فرامل، فلاتر، بطاريات، محركات،
              وزيوت TRU4 الأصلية — بضمان المصنع المباشر والشحن السريع لجميع المحافظات والدفع عند
              الاستلام بعد المعاينة.
            </p>

            {/* Quick Guarantees Row */}
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-secondary/90">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" />
                <span>مطابقة ميكانيكية 100%</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-accent" aria-hidden="true" />
                <span>معاينة قبل الدفع والاستلام</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
                <span>توصيل لكافة الورش والمحافظات</span>
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
              <Link
                to="/catalog"
                className="btn-press inline-flex items-center gap-2 rounded-[10px] bg-accent px-6 py-3.5 text-sm font-bold text-white shadow-xs transition duration-150 hover:bg-accent-hover cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                <span>تصفح الكتالوج الرسمي</span>
              </Link>
              <a
                href="#vehicle-selector"
                className="btn-press inline-flex items-center gap-2 rounded-[10px] border border-border bg-surface px-6 py-3.5 text-sm font-semibold text-heading shadow-xs transition duration-150 hover:bg-alt hover:border-accent/40 cursor-pointer"
              >
                <span>تحديد موديل دراجتك</span>
                <ChevronLeft className="h-4 w-4 text-secondary" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Left Column (Cinematic Motorcycle Showroom Stage) - 6 cols on lg */}
          <div className="order-1 lg:order-2 lg:col-span-6 animate-fade-in">
            <div className="relative overflow-hidden rounded-[20px] border border-border/90 bg-gradient-to-b from-surface to-alt/70 p-2 sm:p-3 shadow-md transition duration-300 hover:shadow-xl group">
              {/* Inner Showcase Stage */}
              <div className="relative overflow-hidden rounded-[14px] bg-black/5 aspect-16/10 sm:aspect-16/9 flex items-center justify-center">
                <img
                  src={heroMotorcycleImg}
                  alt="دراجة TVS Apache RR 310 الأصلية في صالة عرض عزاب موتو"
                  width={960}
                  height={540}
                  loading="eager"
                  className="h-full w-full object-cover object-center transition duration-700 ease-out group-hover:scale-[1.03]"
                />

                {/* Subtle Cinematic Bottom Vignette Gradient */}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                  aria-hidden="true"
                />

                {/* Badges on Hero Showcase */}
                <div className="absolute bottom-3 start-3 end-3 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-bold backdrop-blur-md border border-white/20">
                      TVS Apache RR 310
                    </span>
                    <span className="hidden sm:inline-flex rounded-full bg-accent/90 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                      Flagship Racing
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-white/80 drop-shadow-xs">
                    صالة عرض عزاب موتو
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
