import { Link } from 'react-router-dom'
import {
  Disc,
  Filter,
  Zap,
  BatteryCharging,
  CircleDot,
  Droplet,
  Cog,
  ShieldCheck,
  Package,
} from 'lucide-react'
import { useCategories } from '@/features/catalog/hooks/useCategories'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'

function getCategoryIcon(iconName: string) {
  switch (iconName.toLowerCase()) {
    case 'disc':
      return Disc
    case 'filter':
      return Filter
    case 'zap':
      return Zap
    case 'batterycharging':
      return BatteryCharging
    case 'circledot':
      return CircleDot
    case 'droplet':
      return Droplet
    case 'cog':
      return Cog
    case 'shieldcheck':
      return ShieldCheck
    default:
      return Package
  }
}

export function CategoriesSection() {
  const { categories } = useCategories()
  const ref = useScrollReveal<HTMLElement>()

  return (
    <section
      ref={ref}
      aria-labelledby="categories-heading"
      className="border-t border-border bg-alt py-14 sm:py-18"
    >
      <div className="container mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            تصنيفات القطع
          </p>
          <h2
            id="categories-heading"
            className="mt-1 font-heading text-2xl font-extrabold text-heading sm:text-3xl"
          >
            تسوق حسب قسم قطع الغيار
          </h2>
          <p className="mt-2 text-sm text-body">تصفح سريع ومباشر لجميع مستلزمات الصيانة والمحرك</p>
        </div>

        {/* Circular icons grid */}
        <div className="grid grid-cols-4 gap-4 sm:grid-cols-4 md:grid-cols-8 sm:gap-6">
          {categories.map((cat, idx) => {
            const Icon = getCategoryIcon(cat.icon)

            return (
              <Link
                key={cat.id}
                to={`/catalog/category/${cat.slug}`}
                style={{ animationDelay: `${idx * 50}ms` }}
                className="group flex flex-col items-center text-center transition duration-200 hover:-translate-y-1"
              >
                {/* Sand circular icon with outline Lucide in #5B7083 */}
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-surface border border-border shadow-xs transition duration-200 group-hover:border-accent group-hover:bg-promo group-hover:shadow-card-hover group-active:scale-95">
                  <Icon
                    className="h-7 w-7 sm:h-8 sm:w-8 text-secondary transition duration-200 group-hover:text-accent group-hover:scale-110"
                    aria-hidden="true"
                  />
                </div>

                <span className="mt-2.5 font-heading text-xs font-bold text-heading transition group-hover:text-accent sm:text-sm">
                  {cat.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
