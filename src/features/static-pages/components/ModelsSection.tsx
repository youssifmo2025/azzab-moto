import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useModels } from '@/features/vehicle-selector/hooks/useModels'
import { useProducts } from '@/features/catalog/hooks/useProducts'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'

export function ModelsSection() {
  const { models } = useModels()
  const { products } = useProducts()
  const ref = useScrollReveal<HTMLElement>()

  return (
    <section ref={ref} aria-labelledby="models-heading" className="bg-base py-14 sm:py-18">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              موديلات TVS
            </p>
            <h2
              id="models-heading"
              className="mt-1 font-heading text-2xl font-extrabold text-heading sm:text-3xl"
            >
              تصفح قطع الغيار حسب الموديل
            </h2>
          </div>
          <Link
            to="/catalog"
            className="hidden items-center gap-1 text-sm font-semibold text-accent transition hover:text-accent-hover sm:inline-flex"
          >
            <span>كل الموديلات</span>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
          {models.map((model) => {
            const partsCount = products.filter((p) =>
              p.compatibility.some((c) => c.modelId === model.id),
            ).length

            return (
              <Link
                key={model.id}
                to={`/catalog?modelId=${model.id}`}
                className="group flex flex-col overflow-hidden rounded-[10px] border border-border bg-surface transition duration-200 hover:-translate-y-1 hover:shadow-card-hover"
              >
                {/* Real motorcycle image on light sand background */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-alt p-4 flex items-center justify-center">
                  <div className="flex h-full w-full items-center justify-center text-secondary/50">
                    <span className="font-heading text-base font-bold text-secondary">
                      {model.name}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-heading text-sm font-bold text-heading transition group-hover:text-accent">
                    {model.name}
                  </h3>
                  <p className="mt-1 text-xs text-body font-numeric tabular">
                    {partsCount > 0 ? `${partsCount} قطعة غيار متوفرة` : 'قطع غيار أصلية'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
