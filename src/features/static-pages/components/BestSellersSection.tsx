import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useBestSellers } from '@/features/catalog/hooks/useProducts'
import { ProductCard } from '@/features/catalog/components/ProductCard'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'

export function BestSellersSection() {
  const { products, loading } = useBestSellers(8)
  const ref = useScrollReveal<HTMLElement>()

  return (
    <section ref={ref} aria-labelledby="bestsellers-heading" className="bg-base py-14 sm:py-18">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              اختيارات شائعة
            </p>
            <h2
              id="bestsellers-heading"
              className="mt-1 font-heading text-2xl font-extrabold text-heading sm:text-3xl"
            >
              القطع الأكثر طلباً
            </h2>
          </div>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent transition hover:text-accent-hover"
          >
            <span>عرض كل الكتالوج</span>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-[10px] border border-border bg-surface p-4"
              >
                <div className="aspect-square w-full rounded-[8px] bg-alt" />
                <div className="mt-3 h-4 w-3/4 rounded bg-alt" />
                <div className="mt-2 h-3 w-1/2 rounded bg-alt" />
                <div className="mt-4 flex items-center justify-between">
                  <div className="h-5 w-16 rounded bg-alt" />
                  <div className="h-7 w-14 rounded bg-alt" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
